import json
import logging
import random
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date

from parsel import Selector
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException, TimeoutException

from config import (
    MAX_WORKERS, MAX_RETRIES, RETRY_DELAY,
    plp_collection as source_col, pdp_collection as output_col
)

PAGE_LOAD_TIMEOUT = 45
DATA_WAIT_TIMEOUT = 20
HEADFUL = True

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(threadName)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("scraper.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)


HEADERS = [
    "platform", "listing_type","category", "Property_URL", "project_name",
    "property_subtitle", "property_type", "address", "locality",
    "city", "state", "latitude", "longitude", "pincode", "bhk_type",
    "bedrooms", "bathrooms", "balconies", "furnishing_status",
    "built_up_area", "carpet_area", "price_per_sqft", "area_unit",
    "parsed_price", "security_deposit", "rera_id", "posted_date",
    "updated_date", "scraped_date",
]

_thread_local = threading.local()


def _build_driver() -> webdriver.Chrome:
    options = Options()
    if not HEADFUL:
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
    else:
        options.add_argument("--start-maximized")

    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    driver = webdriver.Chrome(options=options)
    driver.execute_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return driver

_driver_launch_lock = threading.Lock()


def get_driver() -> webdriver.Chrome:
    driver = getattr(_thread_local, "driver", None)
    if driver is None:
        with _driver_launch_lock:
            driver = _build_driver()
            time.sleep(random.uniform(0.4, 1.0))
        _thread_local.driver = driver
    return driver


def _ensure_driver_alive(driver: webdriver.Chrome) -> webdriver.Chrome:
    try:
        _ = driver.current_url
        return driver
    except Exception:
        logger.warning("Driver appears dead — rebuilding.")
        quit_driver()
        return get_driver()


def quit_driver() -> None:
    driver = getattr(_thread_local, "driver", None)
    if driver is not None:
        try:
            driver.quit()
        except Exception:
            pass
        _thread_local.driver = None


def extract_pincode(subtitle):
    if not subtitle:
        return ""
    match = re.search(r"\b\d{6}\b", subtitle)
    return match.group(0) if match else ""


def get_nested(data, path, default=None):
    try:
        for key in path.split("."):
            if isinstance(data, dict):
                data = data.get(key)
            else:
                return default
            if data is None:
                return default
        return data
    except Exception:
        return default


def _wait_for_page_ready(driver) -> None:
    end_time = time.time() + DATA_WAIT_TIMEOUT
    while time.time() < end_time:
        try:
            if "__initialData__" in driver.page_source:
                return
            ready_state = driver.execute_script("return document.readyState")
            if ready_state == "complete":
                return
        except WebDriverException:
            return
        time.sleep(0.5)


def fetch_page(url: str) -> str | None:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            driver = get_driver()
            driver = _ensure_driver_alive(driver)
            driver.get(url)
            _wait_for_page_ready(driver)

            html_text = driver.page_source

            if html_text and "__initialData__" in html_text:
                return html_text

            lowered = html_text.lower() if html_text else ""
            if "access denied" in lowered or "403 forbidden" in lowered or not html_text:
                logger.warning(
                    "Blocked/empty page for URL: %s — Retry %d/%d (waiting %ds)...",
                    url, attempt, MAX_RETRIES, RETRY_DELAY,
                )
                quit_driver()
                time.sleep(RETRY_DELAY * attempt + random.uniform(0, 1.5))
                continue

            return html_text

        except TimeoutException:
            logger.warning("Timeout for URL: %s — Retry %d/%d", url, attempt, MAX_RETRIES)
            quit_driver()
            time.sleep(RETRY_DELAY)

        except WebDriverException as exc:
            logger.warning("WebDriver error for URL: %s — %s — Retry %d/%d", url, exc, attempt, MAX_RETRIES)
            quit_driver()
            time.sleep(RETRY_DELAY)

        except Exception as exc:
            logger.warning("Unexpected error for URL: %s — %s — Retry %d/%d", url, exc, attempt, MAX_RETRIES)
            quit_driver()
            time.sleep(RETRY_DELAY)

    logger.error("All %d retries exhausted for URL: %s", MAX_RETRIES, url)
    return None


def parse_v1(data: dict, result: dict, price_per_sqft) -> dict:
    pseudo        = data.get("pseudo", {})
    page_data     = pseudo.get("pageData", {})
    prop_details  = page_data.get("propertyDetails", {})
    prop_data     = prop_details.get("prop_data", {})
    specification = page_data.get("specification", {})
    rei_overview  = page_data.get("reiOverview", {})

    canonical = prop_details.get("canonical_url", "")
    result["Property_URL"] = (canonical if canonical.startswith("http")else "https://www.99acres.com" + canonical)
    result["listing_type"]      = prop_data.get("Transact_Type_Label", "")
    result['category'] = "commercial"
    result["project_name"]      = prop_data.get("Prop_Name", "")
    result["property_subtitle"] = prop_details.get("title", "")
    result["property_type"]     = prop_data.get("Property_Text", "")
    result["address"]           = prop_data.get("localityToBeDisplayed", "") or prop_data.get("AddressTupple", "")
    result["locality"]          = prop_data.get("Locality_Name", "")
    result["city"]              = prop_data.get("City_Text", "")
    result["state"]             = "Gujarat"
    result["latitude"]          = prop_data.get("Latitude", "")
    result["longitude"]         = prop_data.get("Longitude", "")
    result["pincode"]           = extract_pincode(rei_overview.get("subTitle", ""))
    result["bhk_type"]          = f"{prop_data.get('Bedroom_Num', '')} BHK" if prop_data.get("Bedroom_Num") else ""
    result["bedrooms"]          = prop_data.get("Bedroom_Num", "")
    result["bathrooms"]         = prop_data.get("Bathroom_Num", "")
    result["balconies"]         = prop_data.get("Balcony_Num", "")
    result["furnishing_status"] = prop_data.get("Furnish_Label", "") or specification.get("furnishStatusLabel", "")
    tuples = page_data.get('societyDetails', {}).get('configSummary', {}).get('tuples', [])
    tuple_area_display = ""
    if isinstance(tuples, list):
        for t in tuples:
            area_info = t.get('area', {}) if isinstance(t, dict) else {}
            area_type = area_info.get('type', {})
            if isinstance(area_type, dict) and area_type.get('label') == "Super Built-up Area":
                tuple_area_display = area_info.get('display', "")
                break
    result["built_up_area"] = prop_data.get("Local_Super_Area","")  or prop_data.get('Local_Superbuiltup_Area','') or tuple_area_display.replace('sqft', '').strip() or prop_data.get('Builtup_Area','') or  prop_data.get("Superbuiltup_Area", "")
    result["carpet_area"]       = prop_data.get("Local_Carpet_Area", "") or  prop_data.get("Carpet_Area", "")
    # result["price_per_sqft"]    = prop_data.get("Local_Price_Per_Unit_Area_Text", "")
    result["price_per_sqft"]    = price_per_sqft

    result["area_unit"]         = prop_data.get("Carpetarea_Unit", "")
    if not result.get('price_per_sqft'):
        result['price_per_sqft'] = prop_data.get("Price_Per_Unit_Area", "")
        unit_numb = prop_data.get("showPricePerUnitArea", "")
        result["area_unit"] = prop_data.get("Area_Values", "").get(unit_numb)

    result["parsed_price"]      = prop_data.get("Price_Text", "")
    result["security_deposit"]  = prop_data.get("Deposit_Value", "")
    rera = prop_data.get("reraData", {})
    result["rera_id"]           = rera.get("RERA_REGISTRATION_NUMBER", "")
    result["posted_date"]       = prop_data.get("Register_Date", "")
    result["updated_date"]      = prop_data.get("Modify_Date", "")
    return result


def parse_v2(data: dict, result: dict, price_per_sqft) -> dict:
    pd            = data.get("pd", {})
    page_data     = pd.get("pageData", {})
    prop_details  = page_data.get("propertyDetails", {})
    prop_data     = prop_details.get("prop_data", {})
    seo_schema    = page_data.get("seoSchema", {})
    specification = page_data.get("specification", {})
    society       = page_data.get("societyDetails", {})
    rei_overview  = page_data.get("reiOverview", {})
    canonical = prop_details.get("canonical_url", "")
    result["Property_URL"] = (
        canonical if canonical.startswith("http")
        else "https://www.99acres.com" + canonical
    )
    result["listing_type"]      = prop_data.get("Transact_Type_Label", "")
    result['category'] = "commercial"
    result["project_name"]      = prop_data.get("Prop_Name", "") or get_nested(society, "projectData.projectName", "")
    result["property_subtitle"] = prop_details.get("title", "")
    result["property_type"]     = prop_data.get("Property_Text", "")
    result["address"]           = prop_data.get("localityToBeDisplayed", "") or prop_data.get("AddressTupple", "")
    locality_raw                = seo_schema.get("localityName", "")
    result["locality"]          = prop_data.get("Locality_Name", "") or (locality_raw.split(",")[0] if locality_raw else "")
    result["city"]              = prop_data.get("City_Text", "") or seo_schema.get("cityName", "")
    result["state"]             = "Gujarat"
    result["latitude"]          = prop_data.get("Latitude", "") or seo_schema.get("latitude", "")
    result["longitude"]         = prop_data.get("Longitude", "") or seo_schema.get("longitude", "")
    result["pincode"]           = extract_pincode(rei_overview.get("subTitle", ""))
    result["bhk_type"]          = f"{prop_data.get('Bedroom_Num', '')} BHK" if prop_data.get("Bedroom_Num") else ""
    result["bedrooms"]          = prop_data.get("Bedroom_Num", "")
    result["bathrooms"]         = prop_data.get("Bathroom_Num", "")
    result["balconies"]         = prop_data.get("Balcony_Num", "")
    result["furnishing_status"] = specification.get("furnishStatusLabel", "") or prop_data.get("Furnish_Label", "")
    tuples = page_data.get('societyDetails',{}).get('configSummary',{}).get('tuples',[])
    tuple_area_display = ""
    if isinstance(tuples, list):
        for t in tuples:
            area_info = t.get('area', {}) if isinstance(t, dict) else {}
            area_type = area_info.get('type', {})
            if isinstance(area_type, dict) and area_type.get('label') == "Super Built-up Area":
                tuple_area_display = area_info.get('display', "")
                break
    result["built_up_area"]     = prop_data.get("Local_Super_Area","")  or prop_data.get('Local_Superbuiltup_Area','') or tuple_area_display.replace('sqft', '').strip() or prop_data.get('Builtup_Area','') or  prop_data.get("Superbuiltup_Area", "")
    result["carpet_area"]       = prop_data.get("Local_Carpet_Area", "") or prop_data.get("Carpet_Area", "")
    # result["price_per_sqft"]    = prop_data.get("Local_Price_Per_Unit_Area_Text", "")
    result["area_unit"]         = prop_data.get("Carpetarea_Unit", "")

    # result['price_per_sqft'] = prop_data.get("Local_Price_Per_Unit_Area", "")
    result['price_per_sqft'] = price_per_sqft
    unit_numb = prop_data.get("Local_Price_Per_Unit_Area_Unit", "")
    # result["area_unit"] = prop_data.get("Area_Values", "").get(unit_numb)
    # if not result['price_per_sqft']:
    #     result['price_per_sqft'] = prop_data.get('Price_Per_Unit_Area')
    #     result['area_unit'] = "sqyd"


    result["parsed_price"]      = prop_data.get("Price_Text", "")
    result["security_deposit"]  = prop_data.get("Deposit_Value", "")
    rera = prop_data.get("reraData", {})
    result["rera_id"]           = rera.get("RERA_REGISTRATION_NUMBER", "")
    result["posted_date"]       = prop_data.get("Register_Date", "")
    result["updated_date"]      = prop_data.get("Modify_Date", "")
    return result


def parse_project(data: dict, result: dict, price_per_sqft) -> dict:
    project_detail = data.get("projectDetailState", {})
    page_data      = project_detail.get("pageData", {})
    basic          = page_data.get("basicData", {})
    summary        = page_data.get("summary", {})
    location       = page_data.get("locationDetail", {})

    result["listing_type"]    = ''
    result['category'] = "commercial"
    result["Property_URL"]    = 'https://www.99acres.com' + basic.get("url", "")
    result["project_name"]    = basic.get("name", "")
    result["property_subtitle"] = basic.get("type", "")
    result["property_type"]   = basic.get("type", "")
    result["address"]         = location.get("address", "")
    result["locality"]        = location.get("localityName", "")
    result["city"]            = location.get("cityName", "")
    result["state"]           = "Gujarat"
    result["latitude"]        = location.get("latitude", "")
    result["longitude"]       = location.get("longitude", "")
    configs = summary.get("configurations", [])
    if configs:
        result["bhk_type"] = ", ".join([c.get("title", "") for c in configs])
        result["bedrooms"] = result["bhk_type"]
    size_obj = summary.get("size", {})
    result["built_up_area"]  = f"{size_obj.get('minValue', '')} - {size_obj.get('maxValue', '')}"
    # result["price_per_sqft"] = summary.get("pricePerSqft", {}).get("displayValue", "")
    result["price_per_sqft"] = price_per_sqft
    result["area_unit"]      = size_obj.get("unit", "")
    price_obj = summary.get("price", {})
    result["parsed_price"]   = f"{price_obj.get('minValue', '')} - {price_obj.get('maxValue', '')}"
    rera = summary.get("rera", {})
    result["rera_id"]        = rera.get("registrationNumber", "")
    return result


def process_doc(doc: dict) -> None:
    doc_id      = doc["_id"]
    listing_url = doc.get("property_url")

    if not listing_url:
        logger.warning("No 'property_url' found in doc _id=%s — skipping.", doc_id)
        source_col.update_one({"_id": doc_id}, {"$set": {"status": "Failed"}})
        return

    logger.info("Starting: %s", listing_url)
    html_text = fetch_page(listing_url)
    if html_text is None:
        logger.error("Failed to fetch after retries — marking Failed: %s", listing_url)
        source_col.update_one({"_id": doc_id}, {"$set": {"status": "Failed"}})
        return
    try:
        dom         = Selector(text=html_text)
        script_text = dom.xpath("//script[contains(text(), '__initialData__')]/text()").get("")
        json_str    = script_text.split("; window")[0].replace("window.__initialData__=", "").replace("; window.__masked__ = true", "")
        result = {key: "" for key in HEADERS}
        result["platform"]     = "99acres.com"
        result["scraped_date"] = date.today().strftime("%Y-%m-%d")
        texts = dom.xpath("//span[contains(normalize-space(.), ' Per ')]//text()").getall()
        texts = [x.strip() for x in texts if x.strip()]
        if texts:
            price_per_sqft = texts[0]
        else:
            price_per_sqft = ""
        if not price_per_sqft:
            price_per_sqft = ''.join(dom.xpath('//div[@class="component__tableTooltip"]/..//div[contains(normalize-space(.), " per ")]/text()').getall()).strip().replace('  @ ','')
        if not price_per_sqft:
            price_per_sqft = ''.join(dom.xpath('//div[@class=" component__details "]/..//*[contains(normalize-space(.), " per ")]/text()').getall()).strip().replace('  @ ', '')
        if not price_per_sqft:
            price_per_sqft = dom.xpath('normalize-space(string(//div[@id="pricePerUnitArea"]))').get(default="").replace("@", "").strip()

        if json_str:
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as exc:
                logger.error("JSON decode failed for URL: %s — %s", listing_url, exc)
                source_col.update_one({"_id": doc_id}, {"$set": {"status": "Failed"}})
                return

            is_v1      = "pseudo" in data and "propertyDetails" in data.get("pseudo", {}).get("pageData", {})
            is_v2      = "pd" in data and "propertyDetails" in data.get("pd", {}).get("pageData", {})
            is_project = "projectDetailState" in data and "pageData" in data.get("projectDetailState", {})
            if is_v1:
                result = parse_v1(data, result,price_per_sqft)
            elif is_v2:
                result = parse_v2(data, result,price_per_sqft)
            elif is_project:
                result = parse_project(data, result,price_per_sqft)
            else:
                parsed_fallback = False
                for key, value in data.items():
                    if not isinstance(value, dict):
                        continue
                    page_data = value.get("pageData", {})
                    if isinstance(page_data, dict) and "propertyDetails" in page_data:
                        logger.info("Fallback matched via key '%s' for URL: %s", key, listing_url)
                        fallback_data = {"pd": value}
                        result = parse_v2(fallback_data, result,price_per_sqft)
                        parsed_fallback = True
                        break
                if not parsed_fallback:
                    top_keys = list(data.keys())
                    site_chrome_keys = {"global", "hamburgerState", "header", "headerReducer",
                                        "userState", "GdprReducer", "ContactUsReducer", "hamReducer"}
                    if set(top_keys).issubset(site_chrome_keys):
                        logger.warning("Expired/removed listing (no property data): %s", listing_url)
                        source_col.update_one({"_id": doc_id}, {"$set": {"status": "Expired"}})
                        return
                    else:
                        logger.warning("Unknown page structure for URL: %s | Top-level keys: %s", listing_url, top_keys)
        else:
            logger.warning("No __initialData__ JSON found for URL: %s", listing_url)
            source_col.update_one({"_id": doc_id}, {"$set": {"status": "Expired"}})
            return

        output_col.insert_one(result)
        source_col.update_one({"_id": doc_id}, {"$set": {"status": "Done"}})
        logger.info("✓ Done: %s", listing_url)

    except Exception as exc:
        logger.exception("Parse/DB error for URL: %s — %s", listing_url, exc)
        source_col.update_one({"_id": doc_id}, {"$set": {"status": "Failed"}})


def _worker_wrapper(doc: dict) -> None:
    try:
        process_doc(doc)
    finally:
        time.sleep(random.uniform(0.5, 1.5))


def scrape_pdp() -> None:
    query   = {"status": {"$in": ["Pending", "In Progress"]}}
    pending = list(source_col.find(query, {"property_url": 1}))
    total   = len(pending)
    logger.info("Total pending URLs: %d", total)

    if not pending:
        logger.info("Nothing to process. Exiting.")
        return

    doc_ids = [d["_id"] for d in pending]
    source_col.update_many({"_id": {"$in": doc_ids}}, {"$set": {"status": "In Progress"}})

    completed = 0
    try:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS, thread_name_prefix="Scraper") as executor:
            futures = {executor.submit(_worker_wrapper, doc): doc for doc in pending}
            for future in as_completed(futures):
                completed += 1
                try:
                    future.result()
                except Exception as exc:
                    doc = futures[future]
                    logger.error("Unhandled error for doc _id=%s: %s", doc.get("_id"), exc)
                logger.info("Progress: %d / %d completed", completed, total)
    finally:
        quit_driver()

    logger.info("Scraping finished. Total processed: %d", total)


if __name__ == "__main__":
    scrape_pdp()