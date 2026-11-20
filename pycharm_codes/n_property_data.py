from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from parsel import Selector
import datetime
import json
import re
import random
import time
# ---------------- MongoDB ---------------- #

client = MongoClient("mongodb://localhost:27017/")
db = client["Housing_com"]
link_collection = db["link_2026-07-06"]
detail_collection = db[f"detail_{datetime.date.today()}"]
detail_collection.create_index("Property_URL", unique=True)
# ---------------- Common Helpers ---------------- #


def get_property_links():
    links = []
    for doc in link_collection.find({}, {"property_link": 1, "_id": 0}):
        if doc.get("property_link"):
            links.append(doc["property_link"])
    return links


def get_text(selector, xpath):
    value = selector.xpath(xpath).get(default="")
    return value.strip() if value else ""
# ---------------- JSON-LD ---------------- #


def get_json_ld(selector):
    """
    Returns ApartmentComplex JSON-LD
    """
    scripts = selector.xpath("//script[@type='application/ld+json']/text()").getall()
    for script in scripts:
        try:
            data = json.loads(script)
            if isinstance(data, list):
                for item in data:
                    t = item.get("@type")
                    if isinstance(t, list):
                        if "ApartmentComplex" in t:
                            return item
                    elif t == "ApartmentComplex":
                        return item
            elif isinstance(data, dict):
                if data.get("@type") == "ApartmentComplex":
                    return data
        except:
            pass
    return {}
# ---------------- Pincode ---------------- #


def get_pincode(selector):
    scripts = selector.xpath("//script[@type='application/ld+json']/text()").getall()
    for script in scripts:
        try:
            data = json.loads(script)
            if data.get("@type") != "FAQPage":
                continue
            for item in data.get("mainEntity", []):
                answer = item.get("acceptedAnswer", {}).get("text", "")
                m = re.search(r"\b\d{6}\b", answer)
                if m:
                    return m.group()
        except:
            pass
    return ""
# ---------------- RERA ---------------- #


def get_rera(selector):
    scripts = selector.xpath("//script[@type='application/ld+json']/text()").getall()
    for script in scripts:
        try:
            data = json.loads(script)
            if data.get("@type") != "FAQPage":
                continue
            for item in data.get("mainEntity", []):
                answer = item.get("acceptedAnswer", {}).get("text", "")
                m = re.search(r"PR/[A-Za-z0-9/\-]+", answer)
                if m:
                    return m.group()
        except:
            pass
    return ""
# ---------------- Area ---------------- #


def extract_area(selector):
    html = selector.get()
    built_up = ""
    carpet = ""
    built = re.search(r"Built.?up.*?(\d[\d,]*)\s*sq", html, re.I | re.S)
    if built:
        built_up = built.group(1).replace(",", "")
    carpet_match = re.search(r"Carpet area.*?starts from\s*(\d[\d,]*)\s*sq", html, re.I | re.S)
    if carpet_match:
        carpet = carpet_match.group(1).replace(",", "")

    if not built_up:
        m = re.search(r"(\d{3,5})\s*sq\.?\s*ft", html, re.I)
        if m:
            built_up = m.group(1)
    return built_up, carpet
# ---------------- Price ---------------- #


def format_price(price):
    if not price:
        return ""
    try:
        price = int(price)
        if price >= 10000000:
            return f"₹{price / 10000000:.2f} Cr"
        if price >= 100000:
            return f"₹{price / 100000:.2f} Lac"
        return f"₹{price:,}"
    except:
        return ""
# ---------------- Property Type ---------------- #


def get_property_type(bhk):
    bhk = bhk.lower()
    if "apartment" in bhk:
        return "Apartment"
    if "villa" in bhk:
        return "Villa"
    if "plot" in bhk:
        return "Plot"
    if "penthouse" in bhk:
        return "Penthouse"
    return ""
# ---------------- Bedrooms ---------------- #


def get_bedrooms(bhk):
    m = re.search(r"(\d+(?:[-,]\d+)?)", bhk)
    if m:
        return m.group(1)
    return ""


def data_extract():
    links = get_property_links()
    if not links:
        print("No Property Links Found.")
        return
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            slow_mo=100,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--start-maximized",
                "--disable-dev-shm-usage",
                "--no-first-run",
                "--disable-infobars",
            ]
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="en-IN",
            timezone_id="Asia/Kolkata",
            color_scheme="light",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
        )

        page = context.new_page()
        for url in links:
            try:
                print("=" * 100)
                print("Scraping :", url)
                page.goto(url, wait_until="domcontentloaded", timeout=120000)
                page.wait_for_load_state("domcontentloaded")
                page.wait_for_timeout(random.randint(3000, 6000))
                page.mouse.move(
                    random.randint(200, 800),
                    random.randint(100, 600),
                    steps=random.randint(15, 40)
                )
                html = page.content()
                selector = Selector(html)
                project_json = get_json_ld(selector)
                if not project_json:
                    print("JSON-LD Not Found")
                    continue
                # -------------------------------------------------
                # Basic
                # -------------------------------------------------
                project_name = project_json.get("name", "")
                address = project_json.get("geo", {}).get("address", "")
                latitude = project_json.get("geo", {}).get("latitude", "")
                longitude = project_json.get("geo", {}).get("longitude", "")
                # -------------------------------------------------
                # Builder
                # -------------------------------------------------
                builder = ""
                brands = project_json.get("brand", [])
                if brands:
                    builder = brands[0].get("name", "")
                # -------------------------------------------------
                # Price
                # -------------------------------------------------
                price = project_json.get(
                    "offers",
                    {}
                ).get(
                    "lowPrice"
                )
                parsed_price = format_price(price)
                # -------------------------------------------------
                # Location
                # -------------------------------------------------
                place = project_json.get(
                    "containedInPlace",
                    {}
                )
                locality = place.get("name", "")
                city = (
                    place.get(
                        "containedInPlace",
                        {}
                    ).get(
                        "name",
                        ""
                    )
                )
                state = ""
                if "Ahmedabad" in city:
                    state = "Gujarat"
                # -------------------------------------------------
                # Configuration
                # -------------------------------------------------
                bhk = get_text(
                    selector,
                    "//div[text()='Configuration']/preceding-sibling::div/text()"
                )
                bedrooms = get_bedrooms(bhk)
                property_type = get_property_type(bhk)
                # -------------------------------------------------
                # Area
                # -------------------------------------------------
                built_up_area, carpet_area = extract_area(selector)
                area_unit = "sqft"
                # -------------------------------------------------
                # Extra
                # -------------------------------------------------
                pincode = get_pincode(selector)
                rera_id = get_rera(selector)
                possession = project_json.get(
                    "releaseDate",
                    ""
                )
                bathrooms = ""
                balconies = ""
                furnishing_status = ""
                security_deposit = ""
                property_subtitle = ""
                posted_date = ""
                updated_date = get_text(
                    selector,
                    "//div[contains(text(),'Last updated')]/text()"
                ).replace(
                    "Last updated:",
                    ""
                ).strip()
                price_per_sqft = get_text(
                    selector,
                    "//div[text()='Avg. Price']/preceding-sibling::div/text()"
                )
                # -------------------------------------------------
                # Mongo Document
                # -------------------------------------------------
                data = {
                    "platform": "housing.com",
                    "listing_type": "New Project",
                    "category": "Residential",
                    "Property_URL": url,
                    "project_name": project_name,
                    "property_subtitle": property_subtitle,
                    "property_type": property_type,
                    "address": address,
                    "locality": locality,
                    "city": city,
                    "state": state,
                    "latitude": latitude,
                    "longitude": longitude,
                    "pincode": pincode,
                    "builder_name": builder,
                    "possession": possession,
                    "bhk_type": bhk,
                    "bedrooms": bedrooms,
                    "bathrooms": bathrooms,
                    "balconies": balconies,
                    "furnishing_status": furnishing_status,
                    "built_up_area": built_up_area,
                    "carpet_area": carpet_area,
                    "price_per_sqft": price_per_sqft,
                    "area_unit": area_unit,
                    "parsed_price": parsed_price,
                    "security_deposit": security_deposit,
                    "rera_id": rera_id,
                    "posted_date": posted_date,
                    "updated_date": updated_date,
                    "scraped_date": str(datetime.date.today())
                }
                try:
                    detail_collection.insert_one(data)
                    print("Inserted Successfully")
                except DuplicateKeyError:
                    print("Already Exists")
                except Exception as e:
                    print("Mongo Error :", e)
            except Exception as e:
                print("Scraping Error :", e)
            time.sleep(random.uniform(2, 5))
            print(f"Sleeping seconds...")
        browser.close()
# -------------------------------------------------
# Main
# -------------------------------------------------


if __name__ == "__main__":
    start_time = datetime.datetime.now()
    print("=" * 100)
    print("Housing.com Property Scraper Started")
    print("Start Time :", start_time)
    print("=" * 100)
    try:
        data_extract()
    except KeyboardInterrupt:
        print("\nScraper Stopped By User.")
    except Exception as e:
        print("\nFatal Error :", e)
    finally:
        end_time = datetime.datetime.now()
        print("=" * 100)
        print("Scraper Finished")
        print("End Time :", end_time)
        print("Total Time :", end_time - start_time)
        print("=" * 100)
