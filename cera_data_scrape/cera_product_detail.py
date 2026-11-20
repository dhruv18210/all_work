import requests
from selectolax.parser import HTMLParser
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from datetime import datetime
import re
# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["cera_com"]
link_collection = db["test"]
detail_collection = db[f"final_product_detail_2026-07-21"]
detail_collection.create_index("product_link", unique=True)
# Headers
headers = {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 Chrome/119.0 Safari/537.36"
}


def clean_text(node):
    if node:
        return node.text(strip=True)
    return ""


def scrape_product(url):
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = HTMLParser(response.text)
        # Product Name
        product_name = clean_text(soup.css_first(".product-desc h1"))
        # Description
        description = clean_text(soup.css_first(".field--name-body p"))
        # Cat Number
        cat_number = clean_text(soup.css_first("span.cat .field__item"))
        # Product ID
        product_box = soup.css_first(".dropdown-wrapper")
        product_id = ""
        if product_box:
            product_id = product_box.attributes.get("data-pid", "")
        # Variant ID
        variant = soup.css_first(".color-select")
        variant_id = ""
        if variant:
            variant_id = variant.attributes.get("data-vid", "")
        # Color
        color = clean_text(soup.css_first(".dropdown-wrapper li.init"))
        # Price
        price_box = soup.css_first(".price.ss, .price")
        price = clean_text(price_box)
        selling_price = ""
        mrp = ""
        discount = ""
        if price:
            price_box = soup.css_first(".price.ss, .price")
            if price_box:
                selling = price_box.text(strip=True)
                m = re.search(r"₹[\d,]+", selling)
                if m:
                    selling_price = m.group()
            mrp_element = soup.css_first(".item_label_price")
            if mrp_element:
                mrp = clean_text(mrp_element)
            discount_element = soup.css_first(".offer_label")
            if discount_element:
                discount = clean_text(discount_element)
        # Product Details
        product_details = []
        detail = soup.css_first(".field--name-field-product-short-description, .product-details li")
        if detail:
            product_details = [x.strip() for x in detail.text().split("\n") if x.strip()]
        # Main Image
        image = ""
        img = soup.css_first(".ProductdetailImgsSlider img")
        if img:
            image = img.attributes.get("src")
            if image.startswith("/"):
                image = ("https://www.cera-india.com" + image)
        # Specifications
        specifications = {}
        spec_box = soup.css_first("#specifications")
        if spec_box:
            for product in spec_box.css(".product"):
                title = clean_text(product.css_first("h3"))
                values = []
                for li in product.css("li"):
                    values.append(li.text(strip=True))
                if not values:
                    text = product.text(strip=True)
                    text = text.replace(title, "").strip()
                    values = text
                specifications[title] = values
        product_data = {
            "product_link": url,
            "product_name": product_name,
            "breadcrumbs": [x.text(strip=True) for x in soup.css(".breadcrumb-wrapper-product li")],
            "description": description,
            "cat_number": cat_number,
            "product_id": product_id,
            "variant_id": variant_id,
            "color": color,
            "selling_price": selling_price,
            "mrp": mrp,
            "discount": discount,
            "product_details": product_details,
            "image": image,
            "Specifications": specifications,
            "scraped_at": datetime.today().strftime("%Y-%m-%d")
        }
        try:
            detail_collection.insert_one(product_data)
            print("Saved:", product_name, url)
        except DuplicateKeyError:
            print("Already Exists:", url)
    except Exception as e:
        print("Error:", url, e)


def scrape_cera_page():
    print("Loading scraped URLs...")
    scraped_urls = set(doc["product_link"]for doc in detail_collection.find({}, {"product_link": 1, "_id": 0}))
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
    print(f"Progress : {len(scraped_urls)+count}/{total}")


scrape_cera_page()





# scrape_product(url="https://www.cera-india.com/cera/tiles-300-x-300mm-floor-tiles-polished-vitrified-tiles-parking-tiles-finish-matt/plain")
