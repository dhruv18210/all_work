from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import time
import re

# ---------------- MongoDB ---------------- #
client = MongoClient("mongodb://localhost:27017/")
db = client["RealEstate"]
collection = db["99acres_links"]

# Unique index
collection.create_index("property_link", unique=True)

# ---------------- CONFIG ---------------- #
BASE_URL = "https://www.99acres.com/search/property/buy/ahmedabad?city=45&keyword=ahmedabad&preference=S&res_com=R"
MAX_PAGES = 20  # safety cap so it doesn't run forever
STALL_LIMIT = 2  # stop after this many consecutive pages with 0 new links


def build_page_url(base_url, page_num):
    """Append/replace the 'page' query param for pagination."""
    if page_num <= 1:
        return base_url
    if re.search(r"[?&]page=\d+", base_url):
        return re.sub(r"([?&]page=)\d+", rf"\g<1>{page_num}", base_url)
    sep = "&" if "?" in base_url else "?"
    return f"{base_url}{sep}page={page_num}"


def find_card_selector(page):
    """
    Diagnostic helper: 99acres changes its class names periodically.
    Tries a few known/likely patterns and reports which one actually
    matches something on the current page.
    """
    candidates = [
        "div[class*='tupleNew__outerTupleWrap']",
        "//a[@class='ellipsis' or @class='tupleNew__propertyHeading ellipsis']",
        "div[class*='tupleNew']",
        "div[class*='srpTuple']",
        "div[class*='tuple']",
        "a[href*='-spid-']",
    ]
    for sel in candidates:
        try:
            count = page.locator(sel).count()
        except Exception:
            count = 0
        print(f"  selector '{sel}' -> {count} matches")
        if count > 0:
            return sel
    return None


def human_warmup(page):
    """Small human-like interactions to soften obvious automation signals."""
    try:
        page.mouse.move(200, 300)
        page.wait_for_timeout(800)
        page.mouse.move(400, 500)
        page.wait_for_timeout(1200)
        page.mouse.move(650, 400)
        page.wait_for_timeout(600)
    except Exception:
        pass


def scroll_until_stable(page, max_steps=25, pause=1.5, stable_rounds=3):
    """
    Scroll down repeatedly until the page height stops growing (lazy-load
    exhausted) instead of a fixed step count. This is more reliable than
    a hardcoded number of scrolls, since listing counts vary page to page.
    """
    last_height = 0
    stable_count = 0

    for _ in range(max_steps):
        page.mouse.wheel(0, 3000)
        page.wait_for_timeout(int(pause * 1000))

        try:
            height = page.evaluate("document.body.scrollHeight")
        except Exception:
            break

        if height == last_height:
            stable_count += 1
            if stable_count >= stable_rounds:
                break
        else:
            stable_count = 0
            last_height = height


def extract_links_on_page(page, card_selector):
    """Collect all '-spid-' property links currently present in the DOM."""
    links = page.locator(f"{card_selector} a[href], a[href*='-spid-']")
    count = links.count()
    found = set()

    for i in range(count):
        href = links.nth(i).get_attribute("href")
        if not href:
            continue
        if href.startswith("/"):
            href = "https://www.99acres.com" + href
        if "-spid-" not in href:
            continue
        found.add(href)

    return found


def save_debug(page, prefix):
    try:
        page.screenshot(path=f"{prefix}.png", full_page=True)
        with open(f"{prefix}.html", "w", encoding="utf-8") as f:
            f.write(page.content())
    except Exception as e:
        print("  (debug save failed:", repr(e), ")")


def extract():
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir="99acres_profile",
            headless=False,
            channel="chrome",  # requires real Chrome installed; else remove this + args below
            viewport={"width": 1366, "height": 768},
            locale="en-US",
            args=[
                "--disable-blink-features=AutomationControlled",
            ],
        )

        page = context.pages[0] if context.pages else context.new_page()

        print("Opening website...")
        page.goto(BASE_URL, wait_until="domcontentloaded")

        human_warmup(page)
        page.wait_for_timeout(5000)

        if "verifycaptcha" in page.url:
            print("Detected verifycaptcha redirect — waiting, then reloading once...")
            page.wait_for_timeout(8000)
            if "verifycaptcha" in page.url:
                page.reload(wait_until="domcontentloaded")
                page.wait_for_timeout(5000)

        print("\n" + "=" * 80)
        print("Current URL :", page.url)
        print("Page Title  :", page.title())
        print("=" * 80)

        save_debug(page, "debug_before")

        if "verifycaptcha" in page.url:
            print("\n⚠️  Still stuck on the CAPTCHA verification page.")
            print("   Likely IP-based rate limiting rather than a solvable CAPTCHA.")

        print("\n👉 If a CAPTCHA challenge appears, solve it manually in browser.")
        input("Press ENTER AFTER solving CAPTCHA (or once the page has loaded)...")

        try:
            page.wait_for_load_state("networkidle", timeout=15000)
        except Exception:
            pass

        save_debug(page, "debug_after")

        print("\nProbing possible card selectors...")
        card_selector = find_card_selector(page)

        if not card_selector:
            print("❌ No property card container found with any known selector.")
            print("   Check debug_after.html / debug_after.png.")
            context.close()
            return

        print(f"✅ Using selector: {card_selector}")

        # ---------------- PAGE-BY-PAGE LOOP ---------------- #
        total_inserted = 0
        total_unique = set()
        stall_count = 0

        for page_num in range(1, MAX_PAGES + 1):
            target_url = build_page_url(BASE_URL, page_num)

            if page_num > 1:
                print(f"\n--- Navigating to page {page_num}: {target_url}")
                page.goto(target_url, wait_until="domcontentloaded")
                page.wait_for_timeout(3000)

                if "verifycaptcha" in page.url:
                    print("⚠️  Hit CAPTCHA again while paginating — stopping here.")
                    input("Solve it manually then press ENTER to try continuing, "
                          "or Ctrl+C to abort...")
                    try:
                        page.wait_for_load_state("networkidle", timeout=15000)
                    except Exception:
                        pass

            try:
                page.wait_for_selector(card_selector, timeout=20000)
            except Exception as e:
                print(f"❌ No cards found on page {page_num}: {repr(e)}")
                print("   Assuming this is the last page. Stopping pagination.")
                break

            print(f"Scrolling page {page_num} to load all listings...")
            scroll_until_stable(page)

            page_links = extract_links_on_page(page, card_selector)
            new_links = page_links - total_unique

            print(f"Page {page_num}: {len(page_links)} links found, "
                  f"{len(new_links)} new")

            for href in new_links:
                total_unique.add(href)
                try:
                    collection.insert_one({"property_link": href})
                    print("Inserted:", href)
                    total_inserted += 1
                except DuplicateKeyError:
                    print("Already exists:", href)

            if len(new_links) == 0:
                stall_count += 1
                if stall_count >= STALL_LIMIT:
                    print(f"\nNo new links for {STALL_LIMIT} consecutive pages "
                          f"— assuming end of results. Stopping.")
                    break
            else:
                stall_count = 0

        print("\n==============================")
        print("Pages scraped       :", page_num)
        print("Total Unique Links  :", len(total_unique))
        print("New Inserted        :", total_inserted)
        print("==============================")

        if len(total_unique) == 0:
            print("\n⚠️  Zero links extracted across all pages. Check debug_after.html")
            print("   for 'spid' to confirm whether listing data ever loaded.")

        context.close()


extract()
