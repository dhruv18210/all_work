import requests
from lxml import html
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from urllib.parse import urljoin
import time

client = MongoClient("mongodb://localhost:27017/")
db = client["jhonson_com"]
collection = db["johnson_product_link"]
collection.create_index("product_link", unique=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
}

BASE_URL = "https://www.hrjohnsonindia.com"

pages_to_visit = [
    "https://www.hrjohnsonindia.com/collections-all",
    "https://www.hrjohnsonindia.com/concept",
]


def save_links():
    visited_pages = []
    product_links = set()
    print("Starting H&R Johnson scraper...")

    while len(pages_to_visit) > 0:
        current_url = pages_to_visit.pop(0)
        visited_pages.append(current_url)
        print("\nSCRAPING:", current_url)

        try:
            response = requests.get(current_url, headers=HEADERS, timeout=30)
            print(response.status_code, current_url)
        except Exception as error:
            print("ERROR:", current_url, error)
            continue
        if response.status_code != 200:
            continue
        tree = html.fromstring(response.content)
        all_hrefs = tree.xpath("//a[@href]/@href")
        for href in all_hrefs:
            href = href.strip()
            full_url = urljoin(BASE_URL, href)
            page_path = full_url.split(BASE_URL)[-1]
            page_path = page_path.lower()
            if page_path.startswith("/product-") or page_path.startswith("/concept-"):
                product_links.add(full_url)
            elif page_path.startswith("/collections") or "/tile" in page_path:
                if full_url not in visited_pages and full_url not in pages_to_visit:
                    pages_to_visit.append(full_url)
        print("Total products found so far:", len(product_links))
        print("Pages left to visit:", len(pages_to_visit))
        time.sleep(0.5)

    saved_count = 0
    for link in product_links:
        try:
            collection.insert_one({"product_link": link})
            saved_count += 1
        except DuplicateKeyError:
            pass
    print(f"\nSaved {saved_count} new product links to MongoDB")
    print("Done!")


save_links()
