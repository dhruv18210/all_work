from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from parsel import Selector

import datetime
import json
import re
import random
import time
import logging

client = MongoClient("mongodb://localhost:27017/")

db = client["Housing_com"]

link_collection = db["link_2026-07-06"]

detail_collection = db[f"detail_{datetime.date.today()}"]

detail_collection.create_index(
    "Property_URL",
    unique=True
)

HEADLESS = False

PAGE_TIMEOUT = 120000

WAIT_TIME = (2500, 5000)

AREA_UNIT = "sqft"

PLATFORM = "housing.com"

LISTING_TYPE = "New Project"

CATEGORY = "Residential"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


def launch_browser(playwright):
    browser = playwright.chromium.launch(

        headless=HEADLESS,

        slow_mo=50,

        args=[

            "--disable-blink-features=AutomationControlled",

            "--disable-dev-shm-usage",

            "--disable-infobars",

            "--no-first-run",

            "--start-maximized",

        ]
    )

    context = browser.new_context(

        viewport={
            "width": 1920,
            "height": 1080
        },

        locale="en-IN",

        timezone_id="Asia/Kolkata",

        color_scheme="light",

        ignore_https_errors=True,

        user_agent=(
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/137.0.0.0 "
            "Safari/537.36"
        ),
    )

    return browser, context


def get_property_links():
    return [

        doc["property_link"]

        for doc in link_collection.find(

            {},

            {

                "_id": 0,

                "property_link": 1

            }

        )

        if doc.get("property_link")

    ]


def get_text(selector, xpath):
    text = selector.xpath(xpath).get(default="")

    return text.strip()


def clean_text(text):
    if not text:
        return ""

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def safe_json(text):
    try:

        return json.loads(text)

    except Exception:

        return {}


def get_json_scripts(selector):
    return selector.xpath(

        "//script[@type='application/ld+json']/text()"

    ).getall()


def get_json_ld(selector):
    scripts = get_json_scripts(selector)

    for script in scripts:

        data = safe_json(script)

        if isinstance(data, list):

            for item in data:

                types = item.get("@type", [])

                if "ApartmentComplex" in str(types):
                    return item

        elif isinstance(data, dict):

            types = data.get("@type", [])

            if "ApartmentComplex" in str(types):
                return data

    return {}


def get_faq_json(selector):
    scripts = get_json_scripts(selector)

    for script in scripts:

        data = safe_json(script)

        if data.get("@type") == "FAQPage":
            return data

    return {}


def normalize_text(value):
    if not value:
        return ""

    value = re.sub(r"\s+", " ", value)

    return value.strip()


def format_price(price):
    if price in ("", None):
        return ""

    try:

        price = int(float(price))

        if price >= 10000000:
            return f"₹{price / 10000000:.2f} Cr"

        if price >= 100000:
            return f"₹{price / 100000:.2f} Lac"

        return f"₹{price:,}"

    except Exception:

        return ""


def extract_location(project_json):
    address = normalize_text(

        project_json.get("geo", {}).get("address", "")
    )

    latitude = project_json.get(
        "geo",
        {}
    ).get(
        "latitude",
        ""
    )

    longitude = project_json.get(
        "geo",
        {}
    ).get(
        "longitude",
        ""
    )

    locality = ""
    city = ""
    state = ""

    place = project_json.get(
        "containedInPlace",
        {}
    )

    if place:
        locality = place.get("name", "")

        city = place.get(
            "containedInPlace",
            {}
        ).get(
            "name",
            ""
        )

    # -------- Fallback from Address --------

    if address:

        parts = [

            i.strip()

            for i in address.split(",")

            if i.strip()

        ]

        for part in parts:

            if re.fullmatch(r"\d{6}", part):
                continue

            if part.lower() == locality.lower():
                continue

            if part.lower() == city.lower():
                continue

            if part.lower() in [

                "india",

                "bharat"

            ]:
                continue

            if part in [

                "Gujarat",

                "Maharashtra",

                "Rajasthan",

                "Delhi",

                "Karnataka",

                "Tamil Nadu",

                "Telangana",

                "Uttar Pradesh",

                "Madhya Pradesh",

                "Punjab",

                "Haryana",

                "Kerala",

                "West Bengal"

            ]:
                state = part

    return {

        "address": address,

        "locality": locality,

        "city": city,

        "state": state,

        "latitude": latitude,

        "longitude": longitude

    }


def extract_configuration(selector):
    bhk = get_text(

        selector,

        "//div[text()='Configuration']/preceding-sibling::div/text()"

    )

    bedrooms = ""

    property_type = ""

    m = re.search(

        r"(\d+(?:[-,]\d+)?)",

        bhk

    )

    if m:
        bedrooms = m.group(1)

    text = bhk.lower()

    if "apartment" in text:

        property_type = "Apartment"

    elif "villa" in text:

        property_type = "Villa"

    elif "plot" in text:

        property_type = "Plot"

    elif "penthouse" in text:

        property_type = "Penthouse"

    return {

        "bhk_type": bhk,

        "bedrooms": bedrooms,

        "property_type": property_type

    }


def extract_area(selector):
    html = selector.get()

    built_up = ""

    carpet = ""

    # Carpet Area

    carpet_match = re.search(

        r"Carpet area.*?starts from\s*([\d,]+)",

        html,

        re.I | re.S

    )

    if carpet_match:
        carpet = carpet_match.group(1).replace(",", "")

    # Built-up

    built_match = re.search(

        r"Built.?up.*?([\d,]+)\s*sq",

        html,

        re.I | re.S

    )

    if built_match:
        built_up = built_match.group(1).replace(",", "")

    if not built_up:

        floor_matches = re.findall(

            r'(\d{3,5})\s*sq\.?\s*ft',

            html,

            re.I

        )

        if floor_matches:
            nums = [

                int(x)

                for x in floor_matches

            ]

            built_up = str(max(nums))

    return {

        "built_up_area": built_up,

        "carpet_area": carpet,

        "area_unit": AREA_UNIT

    }


def extract_price(selector, project_json):
    low_price = project_json.get(

        "offers",

        {}

    ).get(

        "lowPrice"

    )

    parsed_price = format_price(

        low_price

    )

    price_per_sqft = get_text(

        selector,

        "//div[text()='Avg. Price']/preceding-sibling::div/text()"

    )

    return {

        "parsed_price": parsed_price,

        "price_per_sqft": price_per_sqft

    }


def extract_pincode(faq_json):
    for item in faq_json.get(

            "mainEntity",

            []

    ):

        answer = item.get(

            "acceptedAnswer",

            {}

        ).get(

            "text",

            ""

        )

        m = re.search(

            r"\b\d{6}\b",

            answer

        )

        if m:
            return m.group()

    return ""


def extract_rera(faq_json):
    for item in faq_json.get(

            "mainEntity",

            []

    ):

        answer = item.get(

            "acceptedAnswer",

            {}

        ).get(

            "text",

            ""

        )

        m = re.search(

            r"PR/[A-Za-z0-9/\-]+",

            answer

        )

        if m:
            return m.group()

    return ""


def extract_dates(selector):
    updated = get_text(

        selector,

        "//div[contains(text(),'Last updated')]/text()"

    )

    updated = updated.replace(

        "Last updated:",

        ""

    ).strip()

    return {

        "posted_date": "",

        "updated_date": updated

    }


def extract_builder(project_json):
    brands = project_json.get(

        "brand",

        []

    )

    if brands:
        return brands[0].get(

            "name",

            ""

        )

    return ""


def block_resources(route):
    resource = route.request.resource_type

    if resource in [
        "image",
        "media",
        "font",
        "stylesheet"
    ]:
        route.abort()

    else:
        route.continue_()


def load_page(page, url, retry=3):
    for attempt in range(retry):

        try:

            page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=PAGE_TIMEOUT
            )

            page.wait_for_load_state("domcontentloaded")

            page.wait_for_timeout(
                random.randint(*WAIT_TIME)
            )

            return True

        except Exception as e:

            logger.warning(
                f"Retry {attempt + 1}/{retry} : {e}"
            )

            page.wait_for_timeout(3000)

    return False


def data_extract():
    links = get_property_links()

    if not links:
        logger.info("No Property Links Found.")

        return

    with sync_playwright() as p:

        browser, context = launch_browser(p)

        context.route(
            "**/*",
            block_resources
        )

        page = context.new_page()

        total = len(links)

        logger.info(f"Total Links : {total}")

        for index, url in enumerate(links, start=1):

            logger.info("=" * 80)

            logger.info(
                f"{index}/{total} : {url}"
            )
            loaded = load_page(
                page,
                url
            )

            if not loaded:
                logger.error(
                    "Failed Loading"
                )

                continue
            html = page.content()

            selector = Selector(html)
            project_json = get_json_ld(
                selector
            )

            if not project_json:
                logger.warning(
                    "JSON-LD Missing"
                )

                continue
            faq_json = get_faq_json(
                selector
            )
            location = extract_location(
                project_json
            )

            config = extract_configuration(
                selector
            )

            area = extract_area(
                selector
            )

            price = extract_price(
                selector,
                project_json
            )

            dates = extract_dates(
                selector
            )

            builder = extract_builder(
                project_json
            )

            pincode = extract_pincode(
                faq_json
            )

            rera = extract_rera(
                faq_json
            )
            project_name = project_json.get(
                "name",
                ""
            )

            property_subtitle = ""

            possession = project_json.get(
                "releaseDate",
                ""
            )

            bathrooms = ""

            balconies = ""

            furnishing_status = ""

            security_deposit = ""
            data = {

                "platform": PLATFORM,

                "listing_type": LISTING_TYPE,

                "category": CATEGORY,

                "Property_URL": url,

                "project_name": project_name,

                "property_subtitle": property_subtitle,

                "property_type": config["property_type"],

                "address": location["address"],

                "locality": location["locality"],

                "city": location["city"],

                "state": location["state"],

                "latitude": location["latitude"],

                "longitude": location["longitude"],

                "pincode": pincode,

                "bhk_type": config["bhk_type"],

                "bedrooms": config["bedrooms"],

                "bathrooms": bathrooms,

                "balconies": balconies,

                "furnishing_status": furnishing_status,

                "built_up_area": area["built_up_area"],

                "carpet_area": area["carpet_area"],

                "price_per_sqft": price["price_per_sqft"],

                "area_unit": area["area_unit"],

                "parsed_price": price["parsed_price"],

                "security_deposit": security_deposit,

                "rera_id": rera,

                "posted_date": dates["posted_date"],

                "updated_date": dates["updated_date"],

                "scraped_date": str(datetime.date.today())

            }
            data = {

                key: normalize_text(str(value))

                if isinstance(value, str)

                else value

                for key, value in data.items()

            }
            if not data["project_name"]:
                logger.warning("Project Name Missing")

            if not data["city"]:
                logger.warning("City Missing")

            if not data["parsed_price"]:
                logger.warning("Price Missing")

            if not data["Property_URL"]:
                logger.warning("URL Missing")
            try:

                detail_collection.insert_one(data)

                logger.info("Inserted Successfully")

            except DuplicateKeyError:

                logger.info("Already Exists")

            except Exception as e:

                logger.error(e)
            time.sleep(random.uniform(2, 4))
            context.close()

            browser.close()


if __name__ == "__main__":

    start_time = datetime.datetime.now()

    logger.info("=" * 100)

    logger.info("Housing.com Scraper Started")

    logger.info(start_time)

    try:

        data_extract()

    except KeyboardInterrupt:

        logger.warning("Stopped By User")

    except Exception as e:

        logger.exception(e)

    finally:

        end_time = datetime.datetime.now()

        logger.info("=" * 100)

        logger.info("Finished")

        logger.info(end_time)

        logger.info(end_time - start_time)
