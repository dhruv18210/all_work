
from playwright.sync_api import sync_playwright
from pymongo.errors import DuplicateKeyError
from pymongo import MongoClient
from urllib.parse import quote, urlencode
import csv
import re
import time


def handle_captcha(page):
    captcha_selectors = [
        'iframe[src*="recaptcha"]',
        'iframe[title*="reCAPTCHA"]',
        '#captcha-form',
        'form[action*="Captcha"]',
        'text="unusual traffic"',
        'text="Our systems have detected unusual traffic"',
    ]

    for selector in captcha_selectors:
        try:
            if page.locator(selector).count() > 0:
                print("\nCAPTCHA or Google traffic check detected.")
                print("Solve it manually in the Chrome window.")
                input("After solving the CAPTCHA, press ENTER to continue...")
                return True
        except Exception:
            continue

    return False


def clean_google_id(value):
    """Convert pv-/g/... into /g/..."""
    if not value:
        return ""

    value = value.strip()

    if value.startswith("pv-"):
        value = value[3:]

    return value


def build_place_url(name, address, cid="", google_id=""):
    """
    Prefer a direct CID URL.
    Fall back to a Google Maps search URL.
    """
    if cid:
        return f"https://www.google.com/maps?cid={cid}"

    # A /g/... identifier is not the same as a Maps CID.
    # Do not use it as a CID or a Places API place_id.
    query = f"{name}, {address}".strip(" ,")

    return (
        "https://www.google.com/maps/search/?"
        + urlencode({"api": "1", "query": query})
    )


def restaurant_data():
    with open("UK postal codes.csv", "r", encoding="utf-8-sig", newline="") as file:
        places = csv.DictReader(file)
        with sync_playwright() as p:
            browser = p.chromium.launch(
                channel="chrome",
                headless=False,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                ]
            )
            page = browser.new_page()
            try:
                for row in places:
                    place = (row.get("place name    ") or "").strip()
                    address = (row.get("State") or "").strip()
                    if not place and not address:
                        continue
                    keyword = f"{place} {address}".strip()
                    search_query = f"restaurants near {keyword} UK"
                    search_url = ("https://www.google.com/search?" + urlencode({"q": search_query}))
                    print(f"\nSearching: {keyword}")
                    page.goto(search_url, wait_until="domcontentloaded", timeout=60000)
                    page.wait_for_timeout(2000)
                    handle_captcha(page)
                    # Open "More places", when available.
                    more_places = page.locator('//a[.//span[normalize-space()="More places"]]')
                    try:
                        if more_places.count() > 0:
                            more_places.first.click()
                            page.wait_for_load_state("domcontentloaded", timeout=15000)
                            page.wait_for_timeout(2000)
                    except Exception as exc:
                        print("More places not opened:", exc)
                    page_number = 1
                    while True:
                        print(f"Page {page_number}: {page.url}")
                        # Restaurant cards from the supplied HTML.
                        cards = page.locator("div.w7Dbne")
                        card_count = cards.count()
                        print("Restaurant cards:", card_count)
                        for index in range(card_count):
                            card = cards.nth(index)
                            try:
                                name_locator = card.locator(".OSrXXb").first
                                if name_locator.count() == 0:
                                    continue
                                name = name_locator.inner_text().strip()
                                # Skip empty or irrelevant cards.
                                if not name:
                                    continue
                                # Extract visible address/location.
                                address_locator = card.locator(".rllt__details > div")
                                address_parts = []
                                for j in range(address_locator.count()):
                                    value = (address_locator.nth(j).inner_text().strip())
                                    if value and value != name:
                                        address_parts.append(value)
                                restaurant_address = (
                                    address_parts[1]
                                    if len(address_parts) > 1
                                    else (
                                        address_parts[0]
                                        if address_parts
                                        else keyword
                                    )
                                )
                                # Extract Google internal identifier:
                                # e.g. pv-/g/11mslc_bf5
                                result_id = card.locator('[id^="pv-"]').first
                                google_id = ""
                                if result_id.count() > 0:
                                    google_id = clean_google_id(result_id.get_attribute("id"))
                                # Try to extract a Google CID.
                                cid = ""
                                for selector in [
                                    "[data-ludocid]",
                                    "a[href*='maps?cid=']",
                                    "a[href*='maps/place/']",
                                ]:
                                    elements = card.locator(selector)
                                    for j in range(elements.count()):
                                        element = elements.nth(j)
                                        ludocid = element.get_attribute("data-ludocid" )
                                        href = element.get_attribute("href") or ""
                                        if ludocid and ludocid.isdigit():
                                            cid = ludocid
                                            break
                                        match = re.search(r"[?&]cid=(\d+)", href)
                                        if match:
                                            cid = match.group(1)
                                            break
                                    if cid:
                                        break
                                restaurant_link = build_place_url(name=name,  address=restaurant_address, cid=cid, google_id=google_id)
                                document = {
                                    "restaurant_name": name,
                                    "restaurant_address": restaurant_address,
                                    "google_internal_id": google_id,
                                    "google_cid": cid,
                                    "restaurant_link": restaurant_link,
                                    "search_keyword": keyword,
                                    "source": "Google Search",
                                }
                                # Prevent duplicate restaurant links.
                                collection.update_one({"restaurant_link": restaurant_link},{"$set": document}, upsert=True)
                                print(f"Restaurant: {name}")
                                print(f"Google ID: {google_id}")
                                print(f"CID: {cid}")
                                print(f"Place URL: {restaurant_link}")
                                print("-" * 60)
                            except Exception as exc:
                                print(f"Error extracting card {index}: {exc}")
                        # Go to the next page if available.
                        next_button = page.locator('//a[@id="pnnext"]')
                        if next_button.count() == 0:
                            next_button = page.locator('//div[@aria-label="Next"]')
                        if next_button.count() == 0:
                            print("No next page found.")
                            break
                        try:
                            next_button.first.click(timeout=5000)
                            page.wait_for_load_state("domcontentloaded", timeout=15000)
                            page.wait_for_timeout(1500)
                            page_number += 1
                        except Exception as exc:
                            print("Pagination stopped:", exc)
                            break
                    time.sleep(1)
            finally:
                browser.close()


if __name__ == "__main__":
    mongo = MongoClient("mongodb://localhost:27017/")
    db = mongo["UK_Restaurant_Data"]
    collection = db["Restaurant_link"]
    collection.create_index("restaurant_link", unique=True)
    restaurant_data()
    mongo.close()
