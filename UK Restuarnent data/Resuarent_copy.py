from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import csv
import urllib.parse
import time

def restaurant_data():
    with open("UK postal.csv", "r", encoding="utf-8-sig", newline="") as file:
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
            for row in places:
                place = (row.get("place name") or "").strip()
                address = (row.get("State") or "").strip()
                if not place and not address:
                    continue
                keyword = f"{place} {address}".strip()
                url = ("https://www.google.com/search?q=" + "Restaurant" + urllib.parse.quote(keyword) + "UK")
                page.goto(url, wait_until="domcontentloaded")
                print(f"Searching: {keyword}")
                more_places = page.locator('//a[.//span[normalize-space()="More places"]]')



                try:
                    more_places.first.wait_for(state="visible", timeout=3000)
                    more_places.first.click()
                    page.wait_for_load_state("domcontentloaded")
                    page.wait_for_timeout(2000)
                    while True:
                        next_button = page.locator('//div[@aria-label="Next"]//span[@class="z1asCe"]')
                        print("Current URL:", page.url)
                        print("Next button count:", next_button.count())
                        if next_button.count() == 0:
                            print("Pagination not found on this page")
                            break
                        next_button.scroll_into_view_if_needed()
                        next_button.wait_for(state="visible", timeout=5000)
                        next_button.click()
                        page.wait_for_load_state("domcontentloaded")
                        page.wait_for_timeout(2000)
                        print("Moved to:", page.url)
                except Exception as e:
                    print("Pagination error:", e)
                time.sleep(2)
            browser.close()


if __name__ == "__main__":
    mongo = MongoClient("mongodb://localhost:27017/")
    db = mongo["UK_Restaurant_Data"]
    collection = db["Restaurant_link"]
    collection.create_index("restaurant_link", unique=True)
    restaurant_data()

