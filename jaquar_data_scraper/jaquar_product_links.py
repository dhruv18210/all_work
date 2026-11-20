import requests
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import datetime
import time
import random
from urllib.parse import urljoin
from urllib.parse import quote
from lxml import html

client = MongoClient("mongodb://localhost:27017/")
db = client["jaguar_data"]
collection = db["jaquar_product_links_2026-07-27"]
collection.create_index("product_link", unique=True)

BASE_URL = "https://www.jaquar.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Referer": BASE_URL
}


def get_session():
    s = requests.Session()
    s.headers.update(HEADERS)
    return s


def get_category_links():
    response = session.get(BASE_URL + "/en/")
    tree = html.fromstring(response.text)
    categories = []
    links = tree.xpath("//a/@href")
    for href in links:
        if not href.startswith("/en/"):
            continue
        url = urljoin(BASE_URL, href)
        if "?" in url:
            continue
        if url.endswith("/en/"):
            continue
        if url == BASE_URL + "/en/jaquar-products":
            continue
        if url not in categories:
            categories.append(url)
    return categories


def scrape_category(session, url, level=1):
    print("\n" + "=" * 80)
    print("Level :", level)
    print("URL   :", url)
    response = session.get(url, timeout=30)
    if response.status_code != 200:
        return
    tree = html.fromstring(response.text)
    # Check whether this page has products
    products = tree.xpath("//div[contains(@class,'product-item')]")
    if products:
        print("Products Found")
        if is_scraped(url):
            print("Already Scraped... Skipping")
            return
        print("Scraping Normal Products")
        get_product_links(session, url)
        print("Scraping Filter Products")
        scrape_filters(session, url)
        print("Completed")
        return
    # Otherwise check for child subcategories
    child_links = tree.xpath("//div[@class='prod_inner']/h3/a/@href")
    if child_links:
        print(f"Found {len(child_links)} Child Categories")
        for href in child_links:
            child = urljoin(BASE_URL, href)
            scrape_category(session, child, level + 1)
    else:
        print("No products or child categories found.")


def get_filter_urls(session, subcategory):
    response = session.get(subcategory, timeout=30)
    tree = html.fromstring(response.text)
    filter_urls = []
    groups = tree.xpath("//div[contains(@class,'product-spec-filter')]")
    for group in groups:
        title = group.xpath(".//div[contains(@class,'accordion-title')]/@id")
        if not title:
            continue
        group_name = title[0].replace("heading_", "")
        print(f"\nFilter Group : {group_name}")
        options = group.xpath(".//li")
        for option in options:
            option_id = option.xpath(".//input/@data-option-id")
            option_name = option.xpath(".//label/text()")
            if not option_id or not option_name:
                continue
            option_id = option_id[0]
            option_name = option_name[0].strip()
            url = f"{subcategory}?orderby=0&specs={quote(option_id)}"
            print(f"   {option_name} ({option_id})")
            filter_urls.append({"group": group_name, "name": option_name, "url": url})
    return filter_urls


def scrape_filters(session, subcategory):
    filter_urls = get_filter_urls(session, subcategory)
    print(f"\nTotal Filters : {len(filter_urls)}")
    for i, item in enumerate(filter_urls, start=1):
        print("\n" + "=" * 70)
        print(f"Filter {i}/{len(filter_urls)}")
        print("Group :", item["group"])
        print("Option:", item["name"])
        get_product_links(session, item["url"])


def get_product_links(session, subcategory):
    page = 1
    while True:
        separator = "&" if "?" in subcategory else "?"
        if page == 1:
            url = subcategory
        else:
            url = f"{subcategory}{separator}pagenumber={page}"
        response = session.get(url)
        tree = html.fromstring(response.text)
        links = tree.xpath("//div[contains(@class,'product-item')]//div[@class='picture']/a/@href")
        print("Page Number:", page)
        if not links:
            break
        for href in links:
            product = urljoin(BASE_URL, href)
            try:
                collection.insert_one({"subcategory": subcategory, "product_link": product})
                print("Saved :", product)
            except DuplicateKeyError:
                print("Duplicate :", product)
        next_page = tree.xpath("//li[@class='next-page']/a")
        if not next_page:
            break
        page += 1
        time.sleep(random.uniform(1, 2))


def is_scraped(subcategory):
    return collection.find_one(
        {"subcategory": subcategory},
        {"_id": 1}
    ) is not None


if __name__ == "__main__":
    print("=" * 100)
    print("JAQUAR PRODUCT LINK SCRAPER STARTED")
    print("=" * 100)
    # Create HTTP session
    print("\n[1] Creating Session...")
    session = get_session()
    print("Session Created Successfully")
    # Get all main categories
    print("\n[2] Fetching Main Categories...")
    categories = get_category_links()
    print(f"Total Categories Found : {len(categories)}")
    # Start scraping each category
    for i, category in enumerate(categories, start=1):
        print("\n" + "=" * 100)
        print(f"STARTING CATEGORY {i}/{len(categories)}")
        print(f"Category URL : {category}")
        print("=" * 100)
        print("Checking category structure...")
        print("-> Looking for Products")
        print("-> If Products not found, searching Child Categories recursively")
        print("-> If Child Categories found, scraper will continue automatically")
        print("-> Filters will be scraped after products")
        print("-" * 100)
        scrape_category(session, category)
        print("-" * 100)
        print(f"CATEGORY {i}/{len(categories)} COMPLETED")
        print("-" * 100)
    print("\n" + "=" * 100)
    print("SCRAPING FINISHED SUCCESSFULLY")
    print("=" * 100)
