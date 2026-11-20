import base64
import csv
import json
import os
import random
import re
import time

from curl_cffi import requests
from lxml import html
from playwright.sync_api import sync_playwright

INPUT_CSV = os.path.join(os.getcwd(), "links_result 2.csv")
OUTPUT_CSV = os.path.join(os.getcwd(), "phone_results.csv")
COOKIE_FILE = os.path.join(os.getcwd(), "cookies.json")
SESSION_DIR = os.path.join(os.getcwd(), "chrome_session")

START_ROW = 5001
MIN_DELAY = 3
MAX_DELAY = 3

OUTPUT_FIELDS = [

    "profile_name",
    "profile_url",
    "Phone_number",
    "Url",
    "Name",
    "Location1",
    "Location2",
    "Line_type",
    "Carrier",
]

HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://thatsthem.com/",
    "sec-ch-ua": '"Google Chrome";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}


def save_rows(rows):
    if not rows:
        return
    exists = os.path.exists(OUTPUT_CSV) and os.path.getsize(OUTPUT_CSV) > 0
    try:
        with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
            if not exists:
                writer.writeheader()
            writer.writerows(rows)
    except PermissionError:
        fb = OUTPUT_CSV.replace(".csv", "_backup.csv")
        print(f"    [!] File locked (open in Excel) — writing to fallback: {fb}")
        with open(fb, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
            if not os.path.exists(fb) or os.path.getsize(fb) == 0:
                writer.writeheader()
            writer.writerows(rows)


def read_profiles(path, skip_rows=0):
    profiles = []
    with open(path, newline="", encoding="utf-8") as f:
        for i, row in enumerate(csv.DictReader(f), start=1):
            if i < skip_rows:
                continue
            profiles.append({
                "serial": row.get("serial", str(i)),
                "name": row.get("name", ""),
                "url": row["url"]
            })
    return profiles


def get_already_scraped_data():
    scraped_phones = set()
    scraped_profiles = set()
    total_rows = 0

    target_files = [OUTPUT_CSV]
    fb = OUTPUT_CSV.replace(".csv", "_backup.csv")
    if os.path.exists(fb):
        target_files.append(fb)

    for file_path in target_files:
        if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
            try:
                with open(file_path, newline="", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for r in reader:
                        total_rows += 1
                        url_val = r.get("Url") or r.get("phone_url")
                        if url_val:
                            scraped_phones.add(url_val.strip().lower())
                        if r.get("profile_url"):
                            scraped_profiles.add(r["profile_url"].strip().lower())
            except Exception:
                pass

    return scraped_phones, scraped_profiles, total_rows


def get_fresh_cookies():
    print("\n" + "=" * 65)
    print("  [*] Cloudflare verification needed. Opening Chrome...")
    print("  [*] If prompted, click 'Verify you are human' in Chrome...")
    print("=" * 65 + "\n")

    with sync_playwright() as pw:
        ctx = pw.chromium.launch_persistent_context(
            user_data_dir=SESSION_DIR,
            channel="chrome",
            headless=False,
            ignore_default_args=["--enable-automation"],
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--excludeSwitches=enable-automation",
                "--useAutomationExtension=false",
            ],
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        """)

        page.goto("https://thatsthem.com/", wait_until="domcontentloaded", timeout=60000)

        # Explicitly wait for human verification to pass (search elements render)
        try:
            page.wait_for_selector("input, form, a[href*='/people/']", timeout=45000)
            time.sleep(2)
        except Exception:
            pass

        # Wait until title is clean
        for _ in range(20):
            title = page.title().lower()
            if ("access denied" not in title
                    and "checking your browser" not in title
                    and "moment" not in title
                    and "attention required" not in title):
                break
            time.sleep(2)

        cookies = {c["name"]: c["value"] for c in ctx.cookies()}
        with open(COOKIE_FILE, "w", encoding="utf-8") as f:
            json.dump(cookies, f, indent=2)

        ctx.close()
        print(f"[+] Fresh cookies saved to {COOKIE_FILE}\n")
        return cookies


def load_cookies():
    if os.path.exists(COOKIE_FILE):
        try:
            with open(COOKIE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if data and ("_sp" in data or "_sb" in data):
                return data
        except Exception:
            pass
    return get_fresh_cookies()


def create_session(cookies):
    sess = requests.Session(impersonate="chrome124")
    sess.headers.update(HEADERS)
    sess.cookies.update(cookies)
    return sess


def fetch_url(session, url, referer=None, max_retries=2):
    req_headers = {}
    if referer:
        req_headers["referer"] = referer

    for attempt in range(max_retries):
        try:
            resp = session.get(url, headers=req_headers, timeout=20, allow_redirects=True)

            # If rate limited (429), pause 35s for Cloudflare token bucket to clear
            if resp.status_code == 429:
                print("    [!] Rate Limit (429) hit — pausing 35s for Cloudflare cooldown...")
                time.sleep(35)
                continue

            # Check for Cloudflare challenge or Access Denied
            if (resp.status_code in (403, 503)
                    or "Checking your browser" in resp.text
                    or "challenge-form" in resp.text
                    or "Access denied" in resp.text):
                print("    [!] Cloudflare challenge detected — refreshing session cookies...")
                fresh_cookies = get_fresh_cookies()
                session.cookies.clear()
                session.cookies.update(fresh_cookies)
                time.sleep(3)
                continue
            return resp
        except Exception:
            if attempt == max_retries - 1:
                return None
            time.sleep(2)
    return None


# ──────────────────────────────────────────────────────────────────────────────
# HTML PARSER: EXTRACT 1ST RESULT DETAILS
# ──────────────────────────────────────────────────────────────────────────────
def _clean(nodes):
    return " ".join(t.strip() for t in nodes if t.strip())


def parse_phone_page(html_text, phone_url):
    tree = html.fromstring(html_text)

    # Phone number
    phone_number = phone_url.rstrip("/").split("/phone/")[-1]
    heading = _clean(tree.xpath("//h1//text()"))
    m = re.search(r'\d{3}[\-\s]\d{3}[\-\s]\d{4}', heading)
    if m:
        phone_number = m.group(0)

    # Sidebar Phone Details: Location1, Line Type, Carrier
    def sidebar_val(label):
        nodes = tree.xpath(
            f"//div[dt[contains(., '{label}')]]/dd//text() | "
            f"//dt[contains(., '{label}')]/following-sibling::dd//text() | "
            f"//*[contains(text(),'{label}')]/following-sibling::*[1]//text()"
        )
        return _clean(nodes)

    location1 = sidebar_val("Location")
    line_type = sidebar_val("Line Type")
    carrier = sidebar_val("Carrier")

    # Person records on phone page
    records = tree.xpath('//div[contains(@class,"record") and contains(@class,"rounded")]')
    if not records:
        records = tree.xpath('//div[contains(@class,"border-b")][.//h2]')
    if not records:
        records = tree.xpath('//div[contains(@class,"record")]')

    if not records:
        return None

    # First result only as required
    rec = records[0]
    name_nodes = rec.xpath('.//h2//span//text() | .//h2//text()')
    name = " ".join(" ".join(name_nodes).split()).strip()

    # Location2: from 'Lives in ...' in record card
    location2 = ""
    lives_nodes = rec.xpath('.//p[contains(text(),"Lives in")]//text()')
    if lives_nodes:
        location2 = " ".join(" ".join(lives_nodes).split()).replace("Lives in", "").strip()
    if not location2:
        location2 = location1

    return {
        "phone_number": phone_number,
        "name": name,
        "location1": location1,
        "location2": location2,
        "line_type": line_type,
        "carrier": carrier,
    }


# ──────────────────────────────────────────────────────────────────────────────
# MAIN CONTROLLER (TURBO FAST EXECUTION)
# ──────────────────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  ThatsThem Turbo-Fast Phone Scraper (20x Speed Mode)")
    print(f"  Input  -> {INPUT_CSV}")
    print(f"  Output -> {OUTPUT_CSV}")
    print("=" * 65 + "\n")

    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} not found. Run extract_links.py first.")
        raise SystemExit(1)

    cookies = load_cookies()
    session = create_session(cookies)

    total_in_csv = 0
    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        total_in_csv = sum(1 for _ in f) - 1

    profiles = read_profiles(INPUT_CSV, skip_rows=START_ROW)
    total = total_in_csv

    scraped_phones, scraped_profiles, existing_rows = get_already_scraped_data()
    print(f"[*] Total profiles in CSV: {total_in_csv}")
    if START_ROW > 1:
        print(f"[*] Starting from row / index: {START_ROW}")
    if scraped_profiles:
        print(f"[*] {len(scraped_profiles)} profiles already scraped — resuming automatically!")
    if scraped_phones:
        print(f"[*] {len(scraped_phones)} phone URLs already saved ({existing_rows} total rows in CSV).\n")

    saved_count = existing_rows

    for idx, profile in enumerate(profiles, start=START_ROW):
        profile_url = profile["url"]
        profile_name = profile["name"]
        profile_serial = profile.get("serial", str(idx))

        # Auto-resume: skip completed profile
        if profile_url.strip().lower() in scraped_profiles:
            continue

        print(f"\n[{profile_serial}/{total}]  {profile_name}")
        print(f"            {profile_url}")

        # Fetch profile page in ~0.5s via curl_cffi
        resp = fetch_url(session, profile_url)
        if not resp or resp.status_code != 200:
            print(f"    [!] Failed to load profile: status {getattr(resp, 'status_code', 'ERR')}")
            continue

        tree = html.fromstring(resp.text)

        # Strictly extract ONLY spans located under the "Phone Numbers" section
        raw_spans = tree.xpath(
            '//*[contains(text(),"Phone Numbers:")]/following::ul[contains(@class,"dot-condensed")][1]/li/span | '
            '//*[contains(text(),"Phone Numbers")]/following::ul[contains(@class,"dot-condensed")][1]/li/span'
        )

        # Filter strictly for Phone Numbers: exclude emails (@) and addresses
        spans = []
        for sp in raw_spans:
            txt = sp.text_content().strip()
            if "@" in txt:
                continue
            if re.search(r'\d{3}[\-\.\s]', txt):
                spans.append(sp)

        # Cap max 10 phones per person to prevent flooding Cloudflare (e.g. Aastha Patel had 75 phones)
        if len(spans) > 10:
            spans = spans[:10]

        if not spans:
            print("    [~] No phone buttons found — skipping profile.")
            scraped_profiles.add(profile_url.strip().lower())
            continue

        print(f"    [+] {len(spans)} phone button(s) found.")

        # Compute base64 pathname token for direct Alpine resolution
        pathname = "/" + profile_url.split("thatsthem.com/")[-1].lstrip("/")
        p_base64 = base64.b64encode(pathname.encode()).decode().replace("+", "-").replace("/", "_").rstrip("=")

        for p_idx, span in enumerate(spans, start=1):
            token = span.get("x-href.go")

            # If button has no x-href.go, skip immediately to next button
            if not token:
                print(f"    [~] Phone {p_idx}/{len(spans)} has no active link — skipping to next button.")
                continue

            # Build direct resolution URL
            go_url = f"https://thatsthem.com/go/{token}.{p_base64}"

            # Fetch resolved phone page directly (takes ~0.5s)
            phone_resp = fetch_url(session, go_url, referer=profile_url)
            if not phone_resp or phone_resp.status_code != 200 or "/phone/" not in phone_resp.url:
                current_u = getattr(phone_resp, "url", go_url)
                print(
                    f"    [~] Phone {p_idx}/{len(spans)} could not be opened ({current_u}) — skipping to next button.")
                continue

            phone_url = phone_resp.url.strip().lower()
            if phone_url in scraped_phones:
                print(f"    -> Phone {p_idx}/{len(spans)}: {phone_resp.url} (Already scraped — skipping)")
                continue

            parsed = parse_phone_page(phone_resp.text, phone_resp.url)
            if parsed and parsed.get("name"):
                row = {
                    "profile_name": profile_name,
                    "profile_url": profile_url,
                    "Phone_number": parsed["phone_number"],
                    "Url": phone_resp.url,
                    "Name": parsed["name"],
                    "Location1": parsed["location1"],
                    "Location2": parsed["location2"],
                    "Line_type": parsed["line_type"],
                    "Carrier": parsed["carrier"],
                }
                save_rows([row])
                scraped_phones.add(phone_url)
                saved_count += 1
                print(
                    f"    -> Phone {p_idx}/{len(spans)}: {parsed['phone_number']} | [+] Saved: {parsed['name']} | Loc1: {parsed['location1']} | Loc2: {parsed['location2']} | {parsed['line_type']} | {parsed['carrier']}")
            else:
                print(f"    -> Phone {p_idx}/{len(spans)}: {phone_resp.url} | [~] No person record found.")

            # Short gentle delay (1 - 2 sec)
            time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        # Mark profile complete
        scraped_profiles.add(profile_url.strip().lower())

    print("\n" + "=" * 65)
    print(f"[+] All Done! Total rows saved: {saved_count}")
    print(f"    Saved to: {OUTPUT_CSV}")
    print("=" * 65)


if __name__ == "__main__":
    main()

# import csv
# import json
# import os
# import random
# import re
# import time
#
# from lxml import html
# from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
#
# INPUT_CSV   = os.path.join(os.getcwd(), "links_result 2.csv")
# OUTPUT_CSV  = os.path.join(os.getcwd(), "phone_results.csv")
# COOKIE_FILE = os.path.join(os.getcwd(), "cookies.json")
# SESSION_DIR = os.path.join(os.getcwd(), "chrome_session")
#
# START_ROW     = 5001
# MIN_DELAY     = 10
# MAX_DELAY     = 10
# COOLDOWN_429  = 50
#
# OUTPUT_FIELDS = [
#     "profile_name",
#     "profile_url",
#     "Phone_number",
#     "Url",
#     "Name",
#     "Location1",
#     "Location2",
#     "Line_type",
#     "Carrier",
# ]
#
#
# def save_rows(rows):
#     if not rows:
#         return
#     exists = os.path.exists(OUTPUT_CSV) and os.path.getsize(OUTPUT_CSV) > 0
#     try:
#         with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as f:
#             writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
#             if not exists:
#                 writer.writeheader()
#             writer.writerows(rows)
#     except PermissionError:
#         fb = OUTPUT_CSV.replace(".csv", "_backup.csv")
#         print(f"    [!] File locked — writing to {fb}")
#         with open(fb, "a", newline="", encoding="utf-8") as f:
#             writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
#             if not os.path.exists(fb) or os.path.getsize(fb) == 0:
#                 writer.writeheader()
#             writer.writerows(rows)
#
#
# def read_profiles(path, skip_rows=0):
#     profiles = []
#     with open(path, newline="", encoding="utf-8") as f:
#         for i, row in enumerate(csv.DictReader(f), start=1):
#             if i < skip_rows:
#                 continue
#             profiles.append({"serial": row.get("serial", str(i)), "name": row.get("name", ""), "url": row["url"]})
#     return profiles
#
#
# def get_already_scraped_data():
#     scraped_phones = set()
#     scraped_profiles = set()
#     total_rows = 0
#     if os.path.exists(OUTPUT_CSV) and os.path.getsize(OUTPUT_CSV) > 0:
#         try:
#             with open(OUTPUT_CSV, newline="", encoding="utf-8") as f:
#                 reader = csv.DictReader(f)
#                 for r in reader:
#                     total_rows += 1
#                     url_val = r.get("Url") or r.get("phone_url")
#                     if url_val:
#                         scraped_phones.add(url_val.strip().lower())
#                     if r.get("profile_url"):
#                         scraped_profiles.add(r["profile_url"].strip().lower())
#         except Exception:
#             pass
#     return scraped_phones, scraped_profiles, total_rows
#
#
# def _clean(nodes):
#     return " ".join(t.strip() for t in nodes if t.strip())
#
#
# def parse_phone_page_html(html_text, phone_url):
#     tree = html.fromstring(html_text)
#     phone_number = phone_url.rstrip("/").split("/phone/")[-1]
#     heading = _clean(tree.xpath("//h1//text()"))
#     m = re.search(r'\d{3}[\-\s]\d{3}[\-\s]\d{4}', heading)
#     if m:
#         phone_number = m.group(0)
#     def sidebar_val(label):
#         nodes = tree.xpath(
#             f"//div[dt[contains(., '{label}')]]/dd//text() | "
#             f"//dt[contains(., '{label}')]/following-sibling::dd//text() | "
#             f"//*[contains(text(),'{label}')]/following-sibling::*[1]//text()"
#         )
#         return _clean(nodes)
#
#     location1 = sidebar_val("Location")
#     line_type = sidebar_val("Line Type")
#     carrier   = sidebar_val("Carrier")
#     records = tree.xpath('//div[contains(@class,"record") and contains(@class,"rounded")]')
#     if not records:
#         records = tree.xpath('//div[contains(@class,"border-b")][.//h2]')
#     if not records:
#         records = tree.xpath('//div[contains(@class,"record")]')
#
#     results = []
#     seen = set()
#     for rec in records:
#         name_nodes = rec.xpath('.//h2//span//text() | .//h2//text()')
#         name = " ".join(" ".join(name_nodes).split()).strip()
#
#         skip_names = {"phone details", "who's calling", "spokeo", "", "run full background search"}
#         if not name or name.lower() in skip_names:
#             continue
#         location2 = ""
#         lives_nodes = rec.xpath('.//p[contains(text(),"Lives in")]//text()')
#         if lives_nodes:
#             location2 = " ".join(" ".join(lives_nodes).split()).replace("Lives in", "").strip()
#         if not location2:
#             location2 = location1
#
#         key = (name.lower(), location2.lower())
#         if key in seen:
#             continue
#         seen.add(key)
#
#         results.append({
#             "name":         name,
#             "location1":    location1,
#             "location2":    location2,
#             "line_type":    line_type,
#             "carrier":      carrier,
#             "phone_number": phone_number,
#         })
#
#     return results
# def locate_phone_spans(page):
#     selectors = [
#         'xpath=//*[contains(text(),"Phone Numbers:")]/following::ul[@class="dot-condensed text-dark-700"][1]/li/span',
#         'xpath=//*[contains(text(),"Phone Numbers")]/following::ul[contains(@class,"dot-condensed")][1]/li/span',
#         'xpath=//*[contains(text(),"Phone Numbers")]/following::ul[contains(@class,"dot-condensed")][1]/li//span',
#         'xpath=//ul[contains(@class,"dot-condensed")]/li/span',
#         "div:has(h3:text('Phone Numbers')) [role='link'][tabindex='0']",
#         "div:has(h3:text('PHONE NUMBERS')) [role='link'][tabindex='0']",
#         "[role='link'][tabindex='0']",
#     ]
#     for sel in selectors:
#         try:
#             loc = page.locator(sel)
#             if loc.count() > 0:
#                 return loc
#         except Exception:
#             continue
#     return page.locator('xpath=//*[contains(text(),"Phone Numbers:")]/following::ul[@class="dot-condensed text-dark-700"][1]/li/span')
#
#
# def is_page_blocked(page):
#     try:
#         title = page.title().lower()
#         if "access denied" in title or "attention required" in title:
#             return True
#         if page.locator("h1:has-text('Results for')").count() > 0:
#             return False
#         if page.locator(".record").count() > 0:
#             return False
#         if page.locator("h3:has-text('Phone Details')").count() > 0:
#             return False
#         if page.locator('xpath=//*[contains(text(),"Phone Numbers")]').count() > 0:
#             return False
#         if page.locator("h1:has-text('Access denied'), h2:has-text('Access denied')").count() > 0:
#             return True
#         if page.locator("text='blocked due to unusual activity'").count() > 0:
#             return True
#         if page.locator("text='Sampling browser activity'").count() > 0:
#             return True
#         if page.locator("#challenge-running, #challenge-form").count() > 0:
#             return True
#     except Exception:
#         pass
#     return False
#
#
# def wait_and_recover_if_blocked(page, ctx, profile_url=None):
#     if not is_page_blocked(page):
#         return True
#
#     title = ""
#     try:
#         title = page.title().lower()
#     except Exception:
#         pass
#
#     is_denied = "access denied" in title or page.locator("text='blocked due to unusual activity'").count() > 0
#
#     if is_denied:
#         print("\n" + "!" * 65)
#         print("  [!] CLOUDFLARE ACCESS DENIED — SESSION BLOCKED!")
#         print("  [*] Clearing poisoned session cookies...")
#         print("  [*] Opening clean homepage. Please verify in Chrome if prompted...")
#         print("!" * 65 + "\n")
#
#         try:
#             ctx.clear_cookies()
#             if os.path.exists(COOKIE_FILE):
#                 os.remove(COOKIE_FILE)
#         except Exception:
#             pass
#
#         try:
#             page.goto("https://thatsthem.com/", wait_until="domcontentloaded", timeout=30000)
#         except Exception:
#             pass
#
#         # Wait for Turnstile check to clear (up to 90 seconds)
#         for _ in range(30):
#             time.sleep(3)
#             try:
#                 cur_title = page.title().lower()
#                 if ("access denied" not in cur_title
#                         and "checking your browser" not in cur_title
#                         and "moment" not in cur_title
#                         and "attention required" not in cur_title):
#                     print("  [+] Verification cleared! Saving fresh session cookies...")
#                     fresh_cookies = {c["name"]: c["value"] for c in ctx.cookies()}
#                     with open(COOKIE_FILE, "w", encoding="utf-8") as f:
#                         json.dump(fresh_cookies, f, indent=2)
#                     break
#             except Exception:
#                 pass
#
#         if profile_url:
#             print(f"  [*] Returning to profile: {profile_url}\n")
#             try:
#                 page.goto(profile_url, wait_until="domcontentloaded", timeout=30000)
#                 time.sleep(3)
#             except Exception:
#                 pass
#
#         return not is_page_blocked(page)
#
#     # Standard transient check
#     for attempt in range(5):
#         print("    [*] Cloudflare security check running... waiting 4s.")
#         time.sleep(4)
#         if not is_page_blocked(page):
#             try:
#                 fresh_cookies = {c["name"]: c["value"] for c in ctx.cookies()}
#                 if fresh_cookies and ("_sp" in fresh_cookies or "_sb" in fresh_cookies):
#                     with open(COOKIE_FILE, "w", encoding="utf-8") as f:
#                         json.dump(fresh_cookies, f, indent=2)
#             except Exception:
#                 pass
#             return True
#
#     return not is_page_blocked(page)
#
# if __name__ == "__main__":
#     print("=" * 65)
#     print("  That'sThem Phone Scraper  (Stealth Direct Extraction + Auto-Resume)")
#     print(f"  Input  -> {INPUT_CSV}")
#     print(f"  Output -> {OUTPUT_CSV}")
#     print("=" * 65 + "\n")
#
#     if not os.path.exists(INPUT_CSV):
#         print(f"[!] {INPUT_CSV} not found. Run extract_links.py first.")
#         raise SystemExit(1)
#
#     cookies_dict = {}
#     if os.path.exists(COOKIE_FILE):
#         with open(COOKIE_FILE, encoding="utf-8") as f:
#             cookies_dict = json.load(f)
#
#     total_in_csv = 0
#     with open(INPUT_CSV, newline="", encoding="utf-8") as f:
#         total_in_csv = sum(1 for _ in f) - 1
#
#     profiles = read_profiles(INPUT_CSV, skip_rows=START_ROW)
#     total    = total_in_csv
#
#     scraped_phones, scraped_profiles, existing_rows = get_already_scraped_data()
#     print(f"[*] Total profiles in CSV: {total_in_csv}")
#     if START_ROW > 1:
#         print(f"[*] Starting from row / index: {START_ROW}")
#     if scraped_profiles:
#         print(f"[*] {len(scraped_profiles)} profiles already scraped. Resuming from where it stopped!")
#     if scraped_phones:
#         print(f"[*] {len(scraped_phones)} phone URLs already saved ({existing_rows} total rows in CSV).\n")
#
#     global_serial = existing_rows
#
#     with sync_playwright() as pw:
#         browser_ctx = pw.chromium.launch_persistent_context(
#             user_data_dir=SESSION_DIR,
#             channel="chrome",
#             headless=False,
#             ignore_default_args=["--enable-automation"],
#             args=[
#                 "--disable-blink-features=AutomationControlled",
#                 "--disable-infobars",
#                 "--excludeSwitches=enable-automation",
#                 "--useAutomationExtension=false",
#             ],
#             viewport={"width": 1280, "height": 800},
#         )
#
#         page = browser_ctx.pages[0] if browser_ctx.pages else browser_ctx.new_page()
#         page.add_init_script("""
#             Object.defineProperty(navigator, 'webdriver', {
#                 get: () => undefined
#             });
#             Object.defineProperty(navigator, 'plugins', {
#                 get: () => [1, 2, 3, 4, 5]
#             });
#             window.chrome = { runtime: {} };
#         """)
#
#         if cookies_dict:
#             browser_ctx.add_cookies([
#                 {"name": k, "value": v, "domain": "thatsthem.com", "path": "/"}
#                 for k, v in cookies_dict.items()
#             ])
#
#         for idx, profile in enumerate(profiles, start=START_ROW):
#             profile_url  = profile["url"]
#             profile_name = profile["name"]
#             profile_serial = profile.get("serial", str(idx))
#             if profile_url.strip().lower() in scraped_profiles:
#                 continue
#
#             print(f"\n[{profile_serial}/{total}]  {profile_name}")
#             print(f"            {profile_url}")
#             try:
#                 page.goto(profile_url, wait_until="domcontentloaded", timeout=30000)
#             except Exception as e:
#                 print(f"    [!] Failed to load profile: {e} — retrying after pause...")
#                 time.sleep(5)
#                 try:
#                     page.goto(profile_url, wait_until="domcontentloaded", timeout=30000)
#                 except Exception:
#                     continue
#
#             # Recover from Cloudflare check or Access Denied on profile page
#             if not wait_and_recover_if_blocked(page, browser_ctx, profile_url):
#                 print(f"    [!] Profile could not be unblocked — will retry later (not marked as finished).")
#                 time.sleep(10)
#                 continue
#
#             try:
#                 page.wait_for_selector('xpath=//*[contains(text(),"Phone Numbers")]', timeout=6000)
#             except PWTimeout:
#                 pass
#
#             phone_spans = locate_phone_spans(page)
#             phone_count = phone_spans.count()
#
#             if phone_count == 0:
#                 # Double-check that it wasn't blocked before marking as empty
#                 if is_page_blocked(page):
#                     print("    [!] Page is blocked — skipping profile without marking as finished.")
#                     continue
#                 print("    [~] No phone buttons found — skipping profile.")
#                 scraped_profiles.add(profile_url.strip().lower())
#                 continue
#
#             print(f"    [+] {phone_count} phone button(s) found.")
#
#             # Process each phone button on the profile: click, if fails -> skip to next
#             for p_idx in range(phone_count):
#                 try:
#                     # Ensure we are on the profile page
#                     if profile_url not in page.url:
#                         page.goto(profile_url, wait_until="domcontentloaded", timeout=25000)
#
#                     phone_spans = locate_phone_spans(page)
#                     if p_idx >= phone_spans.count():
#                         break
#
#                     span = phone_spans.nth(p_idx)
#                     try:
#                         span.scroll_into_view_if_needed()
#                     except Exception:
#                         pass
#
#                     # Click to navigate to phone page
#                     try:
#                         with page.expect_navigation(timeout=6000, wait_until="domcontentloaded"):
#                             span.click()
#                     except PWTimeout:
#                         pass
#
#                     current_url = page.url
#                     if "/phone/" not in current_url and "/go/" not in current_url:
#                         try:
#                             span.evaluate("el => el.click()")
#                             page.wait_for_url("**/phone/**", timeout=3000)
#                             current_url = page.url
#                         except Exception:
#                             pass
#
#                     # Check if opened in a popup/new tab
#                     target_page = page
#                     if "/phone/" not in current_url and len(browser_ctx.pages) > 1:
#                         for p in browser_ctx.pages:
#                             if p != page and ("/phone/" in p.url or "/go/" in p.url):
#                                 current_url = p.url
#                                 target_page = p
#                                 break
#
#                     # If page is on /go/ redirect, give it 3 seconds to land on /phone/
#                     if "/go/" in current_url and "/phone/" not in current_url:
#                         try:
#                             target_page.wait_for_url("**/phone/**", timeout=3500)
#                             current_url = target_page.url
#                         except Exception:
#                             pass
#
#                     # Give phone page 3s to render records to avoid false block detection
#                     if "/phone/" in current_url:
#                         try:
#                             target_page.wait_for_selector('.record, h1:has-text("Results for"), h3:has-text("Phone Details")', timeout=4000)
#                         except Exception:
#                             pass
#
#                     # If click failed, blocked, or not on phone page: SKIP IT and go to next!
#                     if "/phone/" not in current_url or is_page_blocked(target_page):
#                         print(f"    [~] Phone {p_idx+1}/{phone_count} could not be opened ({current_url}) — skipping to next button.")
#                         if target_page != page:
#                             try:
#                                 target_page.close()
#                             except Exception:
#                                 pass
#                         # Ensure we are back on profile page for next button
#                         if profile_url not in page.url:
#                             try:
#                                 page.goto(profile_url, wait_until="domcontentloaded", timeout=20000)
#                             except Exception:
#                                 pass
#                         continue
#
#                     # Successfully on /phone/ page!
#                     phone_key = current_url.strip().lower()
#
#                     if phone_key in scraped_phones:
#                         print(f"    -> Phone {p_idx+1}/{phone_count}: {current_url} (Already scraped — skipping)")
#                     else:
#                         html_content = target_page.content()
#                         results = parse_phone_page_html(html_content, current_url)
#
#                         if results:
#                             # User requirement: take ONLY the 1st result per phone
#                             first_res = results[0]
#                             row = {
#                                 "profile_name":   profile_name,
#                                 "profile_url":    profile_url,
#                                 "Phone_number":   first_res["phone_number"],
#                                 "Url":            current_url,
#                                 "Name":           first_res["name"],
#                                 "Location1":      first_res["location1"],
#                                 "Location2":      first_res["location2"],
#                                 "Line_type":      first_res["line_type"],
#                                 "Carrier":        first_res["carrier"],
#                             }
#                             save_rows([row])
#                             scraped_phones.add(phone_key)
#                             scraped_profiles.add(profile_url.strip().lower())
#                             print(f"    -> Phone {p_idx+1}/{phone_count}: {current_url} | [+] Saved: {first_res['name']} | loc1: {first_res['location1']} | loc2: {first_res['location2']} | type: {first_res['line_type']} | carrier: {first_res['carrier']}")
#                         else:
#                             print(f"    -> Phone {p_idx+1}/{phone_count}: {current_url} | [~] No results found.")
#
#                     if target_page != page:
#                         try:
#                             target_page.close()
#                         except Exception:
#                             pass
#
#                     # Delay between phone scrapes
#                     delay = random.uniform(MIN_DELAY, MAX_DELAY)
#                     time.sleep(delay)
#
#                     # Return back to profile page for the next phone button
#                     if p_idx < phone_count - 1:
#                         page.go_back(wait_until="domcontentloaded", timeout=10000)
#                         if profile_url not in page.url:
#                             page.goto(profile_url, wait_until="domcontentloaded", timeout=20000)
#
#                 except Exception as e:
#                     print(f"    [~] Phone {p_idx+1} error ({e}) — skipping to next button.")
#                     try:
#                         if profile_url not in page.url:
#                             page.goto(profile_url, wait_until="domcontentloaded", timeout=20000)
#                     except Exception:
#                         pass
#                     continue
#
#             # Mark profile as completed
#             scraped_profiles.add(profile_url.strip().lower())
#
#         try:
#             page.close()
#             browser_ctx.close()
#         except Exception:
#             pass
#
#     print("\n" + "=" * 65)
#     print(f"[+] All Done!  {global_serial} total rows in CSV.")
#     print(f"    {OUTPUT_CSV}")
#     print("=" * 65)
