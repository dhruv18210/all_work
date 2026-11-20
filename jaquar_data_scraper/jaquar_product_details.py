import requests
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import datetime
from lxml import html
import re

client = MongoClient("mongodb://localhost:27017/")
db = client["jaguar_data"]
link_collection = db["jaquar_product_links_2026-07-27"]
detail_collection = db[f"product_detail_{datetime.date.today()}"]
detail_collection.create_index("product_link", unique=True)

headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 Chrome/119.0 Safari/537.36"
}


def scrape_product(url):
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        # with open("page1.html", "w", encoding="utf-8") as f:
        #     f.write(response.text)
        tree = html.fromstring(response.text)
        product_name = tree.xpath("normalize-space(//div[@class='product-description']//h1)").strip()
        product_range = tree.xpath("normalize-space(//li[contains(@class,'ranges')]//div[@class='descrpt-value'])").strip()
        product_code = tree.xpath("normalize-space(//li[contains(@class,'codes')]//div[@class='descrpt-value'])").strip()
        description = tree.xpath("normalize-space(//li[contains(@class,'descrpt')]//div[@class='descrpt-value'])").strip()
        mrp = tree.xpath("normalize-space(//span[contains(@class,'price-value')])").strip()
        image = tree.xpath("//div[contains(@class,'detailImg')]//img/@src")
        image = image[0] if image else ""
        breadcrumbs = tree.xpath("//div[contains(@class,'breadcrumb-wreapper')]//*[@itemprop='name']/text()")
        breadcrumbs = [b.strip() for b in breadcrumbs if b.strip()]
        color = ""
        for script in tree.xpath("//script/text()"):
            m = re.search(r'\$\("\.color-finished"\)\.html\(".*?<span class=\\\\?"value\\\\?">(.*?)</span>', script, re.S)
            if m:
                color = m.group(1).strip()
                break
        product_data = {
            "product_link": url,
            "breadcrumbs": breadcrumbs,
            "product_name": product_name,
            "product_range": product_range,
            "code": product_code,
            "description": description,
            "mrp": mrp,
            "color": color,
            "image": image,
            "scraped_at": datetime.date.today().strftime("%y-%m-%d")
        }
        try:
            detail_collection.insert_one(product_data)
            print("Saved:", product_name, url)
        except DuplicateKeyError:
            print("Already Exists:", url)
    except Exception as e:
        print("Error:", url, e)


def scrape_jaguar_page():
    print("Loading scraped URLs...")
    scraped_urls = set(doc["product_link"] for doc in detail_collection.find({}, {"product_link": 1, "_id": 0}))
    total = link_collection.count_documents({})
    remaining = total - len(scraped_urls)
    print(f"Total Links      : {total}")
    print(f"Already Scraped  : {len(scraped_urls)}")
    print(f"Remaining        : {remaining}")
    count = 0
    for doc in link_collection.find({}, {"product_link": 1, "_id": 0}):
        url = doc["product_link"]
        if url in scraped_urls:
            continue
        scrape_product(url)
        count += 1
    print(f"Progress : {len(scraped_urls) + count}/{total}")


scrape_jaguar_page()
