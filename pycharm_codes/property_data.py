from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from parsel import Selector
from pymongo.errors import DuplicateKeyError
import datetime
import json
import re

client = MongoClient("mongodb://localhost:27017/")
# Collection containing property links
db = client["Housing_com"]
link_collection = db["link_2026-07-06"]
# Collection to store property details
detail_collection = db[f"detail_{datetime.date.today()}"]
detail_collection.create_index("Property_URL", unique=True)


def get_property_links():
    """
    Fetch all property links from MongoDB.
    """
    links = []
    for doc in link_collection.find({}, {"property_link": 1, "_id": 0}):
        if doc.get("property_link"):
            links.append(doc["property_link"])
    return links


def get_text(selector, xpath):
    value = selector.xpath(xpath).get()
    if value:
        return value.strip()
    return ""


def data_extract():
    links = get_property_links()
    if not links:
        print("No property links found.")
        return
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        for url in links:
            print(f"Scraping : {url}")
            page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=60000
            )
            page.wait_for_timeout(3000)
            response_text = page.content()
            with open("housing.html", "w", encoding="utf-8") as f:
                f.write(response_text)
            selector = Selector(response_text)
            # ---------------- Basic ---------------- #
            project_name = selector.xpath("//h1/text()").get("").strip()
            address = selector.xpath("//div[@data-q='address']/text()").get("").strip()
            breadcrumbs = selector.xpath("//a[contains(@class,'breadcrumb')]/text()").getall()
            locality = breadcrumbs[-1].strip() if len(breadcrumbs) >= 3 else ""
            city = breadcrumbs[-2].strip() if len(breadcrumbs) >= 2 else ""
            state = "Gujarat"
            parsed_price = selector.xpath("(//span[contains(text(),'₹')])[1]/text()").get("").strip()
            bhk = selector.xpath("//div[contains(text(),'Configuration')]/preceding-sibling::div/text()").get("").strip()
            bedrooms = bhk.split(" ")[0] if bhk else ""
            price_per_sqft = selector.xpath("//div[class='css-1k19e3']/text()").get("").strip()
            carpet_area = selector.xpath("//div[class='_h3yh40 T_valueStyle'/text()").re_first(r"\d+")
            area_unit = "sq.ft"
            updated_date = selector.xpath("//*[contains(text(),'Last updated')]/text()").get("").replace("Last updated:","").strip()
            posted_date =  selector.xpath("//div[@'_h3yh40 T_valueStyle']/text()").get("").replace("Last updated:","").strip()
            data = {
                "platform": "housing.com",
                "listing_type": "New Project",
                "category": "Buy",
                "Property_URL": url,
                "project_name": project_name,
                "property_subtitle": "",
                "property_type": "Apartment",
                "address": address,
                "locality": locality,
                "city": city,
                "state": state,
                "latitude": "",
                "longitude": "",
                "pincode": "",
                "bhk_type": bhk,
                "bedrooms": bedrooms,
                # "bathrooms": "",
                # "balconies": "",
                # "furnishing_status": "",
                # "built_up_area": "",
                "carpet_area": carpet_area,
                "price_per_sqft": price_per_sqft,
                "area_unit": area_unit,
                "parsed_price": parsed_price,
                # "security_deposit": "",
                # "rera_id": "",
                "posted_date": posted_date,
                "updated_date": updated_date,
                "scraped_date": str(datetime.date.today())
            }

            try:
                detail_collection.insert_one(data)
                print("Inserted")
            except DuplicateKeyError:
                print("Already Exists")
        browser.close()


if __name__ == "__main__":
    data_extract()
