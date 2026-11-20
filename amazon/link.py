from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from urllib.parse import urlparse, parse_qs, unquote, quote

import time

client = MongoClient("mongodb://localhost:27017/")
db = client["amazon"]
link_collection = db["laptop_links"]
link_collection.create_index("product_link", unique=True)

keyword = input("Enter keyword : ")
with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        channel="chrome"
    )
    page = browser.new_page()
    page_no = 1
    while True:
        url = f"https://www.amazon.in/s?k={quote(keyword)}&page={page_no}"
        print(f"\nPage : {page_no}")
        print(url)
        page.goto(url, wait_until="domcontentloaded")
        time.sleep(3)
        products = page.locator("//div[@data-component-type='s-search-result']")
        if products.count() == 0:
            print("No Products Found")
            break
        count = 0
        for i in range(products.count()):
            product = products.nth(i)
            link = product.locator("a.a-link-normal.s-line-clamp-2").first
            if link.count() == 0:
                continue
            href = link.get_attribute("href")
            if not href:
                continue
            if href.startswith("/sspa/"):
                params = parse_qs(urlparse(href).query)
                if "url" in params:
                    href = unquote(params["url"][0])
            if href.startswith("/"):
                product_link = "https://www.amazon.in" + href.split("?")[0]
            else:
                product_link = href.split("?")[0]
            try:
                link_collection.insert_one({"product_link": product_link})
                print("Saved:", url)
            except DuplicateKeyError:
                print("Already Exists:", url)
            count += 1
        print(f"Saved {count} links")
        next_button = page.locator("a.s-pagination-next")
        if next_button.count() == 0:
            break
        classes = next_button.get_attribute("class") or ""
        if "s-pagination-disabled" in classes:
            break
        page_no += 1
    browser.close()
print("\nCompleted")
