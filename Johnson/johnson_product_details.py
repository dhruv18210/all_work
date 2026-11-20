import requests
from lxml import html
from pymongo.mongo_client import MongoClient
from pymongo.errors import DuplicateKeyError
import time


def product_details(url):
    try:
        headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'priority': 'u=0, i',
            'sec-ch-ua': '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
        }
        response = requests.get(url, timeout=30, headers=headers)
        response.raise_for_status()
        tree = html.fromstring(response.text)
        # with open("product_detail.html", "w", encoding="utf-8") as f:
        #     f.write(response.text)
        title = tree.xpath("normalize-space(//div[@class='product-wrapper']//h1)").strip()
        category = tree.xpath("normalize-space(//div[@class='product-category'])").strip()
        description = tree.xpath("normalize-space(//div[@id='product-description'])").strip()
        size = tree.xpath("normalize-space(//div[@id='product-size'])").strip()
        thickness = tree.xpath("normalize-space(//div[@id='product-thickness'])").strip()
        coverage_area = tree.xpath("normalize-space(//div[@id='product-coverage-area'])").strip()
        finish = tree.xpath("normalize-space(//div[@id='product-finish'])").strip()
        material = tree.xpath("normalize-space(//div[@id='product-material'])").strip()
        look = tree.xpath("normalize-space(//div[@id='product-look'])").strip()
        product_range = tree.xpath("normalize-space(//div[@id='product-range'])").strip()
        application = tree.xpath("normalize-space(//div[@id='product-application'])").strip()
        phase = tree.xpath("normalize-space(//div[@id='product-randomness'])").strip()
        images = []
        for img in tree.xpath("//div[contains(@class,'image-item')]//img"):
            src = img.get("src")
            images.append(src)

        data = {
            "product_link": url,
            "product_name": title,
            "product_category": category,
            "product_description": description,
            "product_size": size,
            "product_thickness": thickness,
            "coverage_area / box": coverage_area,
            "product_finishing": finish,
            "product_material": material,
            "product_look": look,
            "product_range": product_range,
            "product_application": application,
            "random_phase": phase,
            "product_images": images,
        }
        time.sleep(1)
        try:
            detail_collection.insert_one(data)
            print("Saved:", title, ":", url)
        except DuplicateKeyError:
            print("Already Exists:", url)
    except Exception as e:
        print("Error:", url, e)


def scrape_data():
    print("Loading scraped URLs...")
    scraped_urls = set(doc["product_link"] for doc in detail_collection.find({}, {"product_link": 1, "_id": 0}))
    total = product_links.count_documents({})
    remaining = total - len(scraped_urls)
    print(f"Total Links      : {total}")
    print(f"Already Scraped  : {len(scraped_urls)}")
    print(f"Remaining        : {remaining}")
    count = 0
    for doc in product_links.find({}, {"product_link": 1, "_id": 0}):
        url = doc["product_link"]
        if url in scraped_urls:
            continue
        product_details(url)
        count += 1
    print(f"Progress : {len(scraped_urls) + count}/{total}")


if __name__ == '__main__':
    client = MongoClient("mongodb://localhost:27017/")
    db = client["jhonson_com"]
    product_links = db["johnson_product_link"]
    detail_collection = db["johnson_product_details"]
    detail_collection.create_index("product_link", unique=True)
    scrape_data()

