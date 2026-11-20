from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import datetime
import random

client = MongoClient("mongodb://localhost:27017/")
db = client["Savitara_com"]
collection = db["link_2026-09-26"]

collection.create_index("property_link", unique=True)

BASE_URL = "https://savitarrealty.com/"


def human_delay(a=2000, b=6000):
    """Random human-like delay"""
    import time
    time.sleep(random.uniform(a / 1000, b / 1000))


def housing_data():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-infobars",
            ]
        )
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        page.goto("https://savitarrealty.com/", wait_until="domcontentloaded")
        input("Search manually then press ENTER...")
        page_no = 1
        while True:
            print(f"\n================ PAGE {page_no} ================\n")
            anchors = page.locator("a[class='h-full']")
            count = anchors.count()

            print("Properties found:", count)

            # ---------------- SCRAPING ---------------- #
            for i in range(count):
                try:
                    el = anchors.nth(i)

                    href = el.get_attribute("href")
                    title = el.get_attribute("title")

                    if not href:
                        continue

                    if href.startswith("/"):
                        href = BASE_URL + href

                    print(title, href)

                    try:
                        collection.insert_one({
                            "property_name": title,
                            "property_link": href
                        })
                    except DuplicateKeyError:
                        pass

                except Exception as e:
                    print("Error:", e)

            # ---------------- NEXT BUTTON LOGIC ---------------- #

            next_btn = page.locator("li.rc-pagination-next")
            if next_btn.count() == 0:
                print("No Next button. Stopping.")
                break
            if not next_btn.first.is_visible():
                print("Next not visible. Stopping.")
                break
            if not next_btn.first.is_enabled():
                print("Next disabled. End reached.")
                break
            print("Going to next page...")
            next_btn.first.click()
            # ---------------- SAFE PAGE LOAD WAIT ---------------- #
            try:
                page.wait_for_load_state("networkidle", timeout=10000)
            except:
                page.wait_for_load_state("domcontentloaded")
            human_delay(4000, 8000)
            page_no += 1
        print("\nScraping finished.")
        browser.close()


if __name__ == "__main__":
    housing_data()
