from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from parsel import Selector
import datetime
import json
import re
import random
import time

from DrissionPage import ChromiumPage, ChromiumOptions

# ---------------- MongoDB ---------------- #

client = MongoClient("mongodb://localhost:27017/")
db = client["Housing_com"]
link_collection = db["link_2026-07-06"]
detail_collection = db[f"property_detail_2026-07-09"]
detail_collection.create_index("Property_URL", unique=True)
# ---------------- Common Helpers ---------------- #

INDIAN_STATES = {
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat",
    "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala", "madhya pradesh",
    "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
    "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura", "uttar pradesh",
    "uttarakhand", "west bengal", "andaman and nicobar islands", "chandigarh",
    "dadra and nagar haveli", "daman and diu", "lakshadweep", "delhi", "new delhi",
    "puducherry", "jammu and kashmir", "ladakh", "ncr"
}


def get_property_links():
    print("Checking database for already scraped properties to resume progress...")
    # Get all URLs that are already in the details collection
    scraped_urls = set()
    for doc in detail_collection.find({}, {"Property_URL": 1, "_id": 0}):
        if doc.get("Property_URL"):
            scraped_urls.add(doc["Property_URL"])

    links = []
    for doc in link_collection.find({}, {"property_link": 1, "_id": 0}):
        url = doc.get("property_link")
        # Only add the URL if it hasn't been scraped yet
        if url and url not in scraped_urls:
            links.append(url)

    print(f"Found {len(scraped_urls)} already scraped. {len(links)} properties remaining to scrape.")
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
                answer = item.get(
                    "acceptedAnswer",
                    {}
                ).get(
                    "text",
                    ""
                )
                m = re.search(r"\b\d{6}\b", answer)
                if m:
                    return m.group()
        except:
            pass
    return ""


# ---------------- RERA ---------------- #


def get_rera(selector):
    scripts = selector.xpath(
        "//script[@type='application/ld+json']/text()"
    ).getall()
    for script in scripts:
        try:
            data = json.loads(script)
            if data.get("@type") != "FAQPage":
                continue
            for item in data.get("mainEntity", []):
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
        except:
            pass
    return ""


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
    m = re.search(
        r"(\d+(?:[-,]\d+)?)",
        bhk
    )
    if m:
        return m.group(1)
    return ""


def data_extract():
    links = get_property_links()
    if not links:
        print("No Property Links Found.")
        return
    co = ChromiumOptions()
    co.headless(False)
    co.set_argument('--start-maximized')

    page = ChromiumPage(co)

    request_count = 0

    for url in links:
        if request_count > 0 and request_count % 30 == 0:
            print("--- Refreshing browser session to avoid tracking ---")
            page.quit()
            time.sleep(random.uniform(5, 10))
            page = ChromiumPage(co)

        request_count += 1

        try:
            print("=" * 100)
            print(f"Scraping [{request_count}/{len(links)}] : {url}")

            if detail_collection.find_one({"Property_URL": url}):
                print("Already Exists in Database. Skipping...")
                continue

            page.get(url, timeout=120)

            # More human-like delays and reading behavior
            time.sleep(random.uniform(2, 4))

            # Scroll down as if a human is reading the page
            for _ in range(random.randint(2, 4)):
                page.scroll.down(random.randint(300, 700))
                time.sleep(random.uniform(0.8, 1.5))

            html = page.html
            selector = Selector(html)
            project_json = get_json_ld(selector)
            if not project_json:
                print("JSON-LD Not Found (Falling back to JS State)")
                project_json = {}
            # -------------------------------------------------
            # Basic
            # -------------------------------------------------
            project_name = project_json.get("name", "")

            # Try getting address from main object, fallback to geo
            address_obj = project_json.get("address")
            if not address_obj:
                address_obj = project_json.get("geo", {}).get("address")

            address = ""
            if isinstance(address_obj, dict):
                address = address_obj.get("streetAddress", "") or address_obj.get("name", "")
            elif isinstance(address_obj, str):
                address = address_obj
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
            # Extract hierarchy from containedInPlace
            places = []
            current_place = project_json.get("containedInPlace")
            while isinstance(current_place, dict):
                name = current_place.get("name")
                if name:
                    places.append(name.strip())
                current_place = current_place.get("containedInPlace")

            if places and places[-1].lower() == "india":
                places.pop()

            locality = ""
            city = ""
            state = ""

            # Check for state anywhere in the places list (search backwards)
            for i in range(len(places) - 1, -1, -1):
                if places[i].lower() in INDIAN_STATES:
                    state = places.pop(i)
                    break
            if not state and isinstance(address_obj, dict) and address_obj.get("addressRegion"):
                state = address_obj.get("addressRegion")

            # Look for city (search forwards to catch the first instance of Ahmedabad)
            found_city_index = -1
            for i in range(len(places)):
                if "ahmedabad" in places[i].lower():
                    city = "Ahmedabad"
                    found_city_index = i
                    break

            if found_city_index != -1:
                places = places[:found_city_index]
            elif places:
                city = places.pop()
            elif not city and isinstance(address_obj, dict) and address_obj.get("addressLocality"):
                city = address_obj.get("addressLocality")

            # The rest is locality
            if places:
                locality = ", ".join(places)
            elif isinstance(address_obj, dict) and address_obj.get("streetAddress"):
                locality = address_obj.get("streetAddress")

            if "ahmedabad" in city.lower() and not state:
                state = "Gujarat"

            # -------------------------------------------------
            # Configuration
            # -------------------------------------------------
            bhk = get_text(
                selector,
                "//div[starts-with(text(), 'Configuration')]/following-sibling::div/text() | //div[starts-with(text(), 'Configuration')]/preceding-sibling::div/text()"
            )
            bedrooms = get_bedrooms(bhk)
            property_type = get_property_type(bhk)

            # -------------------------------------------------
            # Extra
            # -------------------------------------------------
            pincode = get_pincode(selector)
            rera_id = get_rera(selector)


            def get_feature_safe(selector, keyword, max_length=40):
                # Using * to catch div, span, p, etc.
                val = get_text(selector,
                               f"//*[contains(text(), '{keyword}')]/following-sibling::*/text() | //*[contains(text(), '{keyword}')]/preceding-sibling::*/text()")
                val = val.strip()
                return val if len(val) <= max_length else ""

            def get_count_safe(selector, keyword):
                elements = selector.xpath(
                    f"//*[contains(text(), '{keyword}')]/following-sibling::*/text() | //*[contains(text(), '{keyword}')]/preceding-sibling::*/text()").getall()
                for val in elements:
                    val = val.strip()
                    # Counts should be short and not contain dimension symbols
                    if val and len(val) <= 5 and "'" not in val and '"' not in val and "x" not in val.lower():
                        return val
                return ""

            furnishing_status = get_feature_safe(selector, 'furnishing')

            posted_date = get_feature_safe(selector, 'Posted')
            if not posted_date:
                posted_date = selector.xpath("//*[contains(text(), 'Posted on ')]/text()").get(default="").replace(
                    "Posted on", "").strip()
            if not posted_date:
                posted_date = selector.xpath("//*[contains(text(), 'Posted') and contains(text(), 'ago')]/text()").get(
                    default="").strip()
            posted_date = posted_date if len(posted_date) <= 40 else ""

            price_per_sqft = get_feature_safe(selector, 'Avg. Price')
            if not price_per_sqft:
                price_per_sqft = get_feature_safe(selector, 'Avg. rate')

            # -------------------------------------------------
            # JSON Override from JS State
            # -------------------------------------------------
            carpet_area = ''
            build_up_area = ''
            try:
                js_state = page.run_js('return window.__INITIAL_STATE__')
                if js_state:
                    def find_key(obj, key):
                        if isinstance(obj, dict):
                            if key in obj: return obj[key]
                            for v in obj.values():
                                res = find_key(v, key)
                                if res is not None: return res
                        elif isinstance(obj, list):
                            for item in obj:
                                res = find_key(item, key)
                                if res is not None: return res
                        return None

                    # areaConfig
                    area_config = find_key(js_state, 'areaConfig')

                    if area_config and isinstance(area_config, list):
                        for ac in area_config:
                            if not isinstance(ac, dict):
                                continue

                            name = ac.get('name', '')
                            area_info = ac.get('areaInfo')
                            if not isinstance(area_info, dict):
                                continue

                            val = str(area_info.get('value', '')).strip()
                            unit = area_info.get('unit', '')
                            if val and unit:
                                val = f"{val} {unit}".strip()

                            name_lower = name.lower()

                            if 'carpet area' in name_lower:
                                carpet_area = val
                            elif 'super builtup' in name_lower or 'super built-up' in name_lower or 'super built up' in name_lower:
                                build_up_area = val
                            elif 'builtup' in name_lower or 'built-up' in name_lower or 'built up' in name_lower:
                                build_up_area = val
                    # carpet_area and build_up_area are populated from the JSON

                    proj_attrs = find_key(js_state, 'projectAttributes')
                    if proj_attrs and isinstance(proj_attrs, dict) and proj_attrs.get('name'):
                        project_name = proj_attrs.get('name')
                    elif find_key(js_state, 'projectName'):
                        project_name = str(find_key(js_state, 'projectName'))

                    cap = find_key(js_state, 'caption')
                    if cap:
                        property_subtitle = str(cap)

                    # Calculate property_type reliably from bhk_type or project_name
                    type_str = ""
                    if 'bhk_type' in locals() and bhk_type: type_str += str(bhk_type).lower() + " "
                    if 'project_name' in locals() and project_name: type_str += str(project_name).lower()

                    if 'villa' in type_str:
                        property_type = 'Villa'
                    elif 'plot' in type_str or 'land' in type_str:
                        property_type = 'Plot'
                    elif 'independent house' in type_str or 'house' in type_str:
                        property_type = 'Independent House'
                    elif 'penthouse' in type_str:
                        property_type = 'Penthouse'
                    elif 'apartment' in type_str or 'flat' in type_str:
                        property_type = 'Apartment'
                    else:
                        property_type = 'Apartment'

                    geo = find_key(js_state, 'geo') or {}
                    if isinstance(geo, dict):
                        if geo.get('latitude'): latitude = str(geo.get('latitude'))
                        if geo.get('longitude'): longitude = str(geo.get('longitude'))
                        if geo.get('address'): address = str(geo.get('address'))

                    city_obj = find_key(js_state, 'city')
                    if isinstance(city_obj, dict) and city_obj.get('name'):
                        city = str(city_obj.get('name'))

                    faqs = find_key(js_state, 'dedicatedFaqs') or []
                    if isinstance(faqs, list):
                        for faq in faqs:
                            if isinstance(faq, dict):
                                a = faq.get('a', '')
                                m = re.search(r'\b\d{6}\b', a)
                                if m:
                                    pincode = m.group()
                                    break

                    developer = find_key(js_state, 'developer') or {}
                    if isinstance(developer, dict) and developer.get('name'): builder = str(developer.get('name'))

                    poss = find_key(js_state, 'possessionStatus')
                    if poss: possession = str(poss)

                    bhk_lbl = find_key(js_state, 'bhkShortLabel')
                    if bhk_lbl:
                        bhk = str(bhk_lbl)
                        m = re.search(r'\d+', bhk)
                        if m: bedrooms = m.group()

                    price_obj = find_key(js_state, 'price') or {}
                    if isinstance(price_obj, dict) and price_obj.get('displayValue'): parsed_price = str(
                        price_obj.get('displayValue'))

                    avg_price = find_key(js_state, 'averagePrice')
                    if avg_price: price_per_sqft = str(avg_price)

                    r_id = find_key(js_state, 'modifiedReraId')
                    if r_id: rera_id = str(r_id)

                    pd = find_key(js_state, 'postedDate')
                    if pd: posted_date = str(pd)

                    # Try to extract configuration for balconies, bathrooms, furnishing from features
                    features = find_key(js_state, 'features') or []
                    # Sometimes it's in attributes
                    for f in features:
                        # Depends on exact structure, but we rely on fallback HTML otherwise
                        pass

                    # -------------------------------------------------
                    # RESALE PROPERTY OVERRIDE
                    # -------------------------------------------------
                    resale_details = js_state.get('propertyDetails', {}).get('details')
                    if resale_details:
                        title = resale_details.get('title')
                        if title: project_name = str(title)

                        addr_dict = resale_details.get('address', {})
                        if isinstance(addr_dict, dict) and addr_dict.get('address'):
                            address = str(addr_dict.get('address'))

                        sellers = resale_details.get('sellers', [])
                        if isinstance(sellers, list) and len(sellers) > 0:
                            b_name = sellers[0].get('name')
                            if b_name: builder = str(b_name)

                        price_obj = resale_details.get('displayPrice', {})
                        if isinstance(price_obj, dict) and price_obj.get('displayValue'):
                            parsed_price = str(price_obj.get('displayValue'))

                        if 'BHK' in project_name:
                            bhk = project_name
                            m = re.search(r'(\d+)\s*BHK', bhk)
                            if m: bedrooms = str(m.group(1))

                        prop_info = resale_details.get('propertyInformation', {})
                        if isinstance(prop_info, dict):
                            if prop_info.get('bedrooms'): bedrooms = str(prop_info.get('bedrooms'))
                            if prop_info.get('bathrooms') and not bathrooms: bathrooms = str(prop_info.get('bathrooms'))

                        polygons = resale_details.get('polygonsHash', {})
                        if isinstance(polygons, dict):
                            loc = polygons.get('locality', {})
                            if isinstance(loc, dict) and loc.get('name'): locality = str(loc.get('name'))
                            cit = polygons.get('city', {})
                            if isinstance(cit, dict) and cit.get('name'): city = str(cit.get('name'))
                            st = polygons.get('state', {})
                            if isinstance(st, dict) and st.get('name'): state = str(st.get('name'))

                        f_config = resale_details.get('featureAndConfig', [])
                        if isinstance(f_config, list):
                            for fc in f_config:
                                if isinstance(fc, dict):
                                    fc_id = fc.get('id')
                                    if fc_id == 'balconyCount':
                                        balconies = str(fc.get('description', ''))
                                    elif fc_id == 'bathrooms':
                                        bathrooms = str(fc.get('description', ''))

                        try:
                            video_info = js_state.get('meta', {}).get('localityVideoInfo', {})
                            if isinstance(video_info, dict) and video_info.get('address'):
                                m_pin = re.search(r'\b\d{6}\b', str(video_info.get('address')))
                                if m_pin: pincode = str(m_pin.group())
                        except:
                            pass

                        coords = resale_details.get('coords')
                        if isinstance(coords, list) and len(coords) >= 2:
                            latitude = str(coords[0])
                            longitude = str(coords[1])

                        built = resale_details.get('builtUpArea', {})
                        if isinstance(built, dict) and built.get('value'):
                            build_up_area = f"{built.get('value')} {built.get('unit', '')}".strip()

                        carpet = resale_details.get('carpetArea', {})
                        if isinstance(carpet, dict) and carpet.get('value'):
                            carpet_area = f"{carpet.get('value')} {carpet.get('unit', '')}".strip()

                        f_type = resale_details.get('furnishingType')
                        if f_type: furnishing_status = str(f_type)
            except Exception as e:
                print('Error evaluating js_state:', e)

            # -------------------------------------------------
            # Validation Check
            # -------------------------------------------------
            if not project_name and not address and not city:
                if not js_state:
                    print("Page blocked or failed to load completely. Skipping so it can be retried later.")
                else:
                    print("Property data is blank (Likely a dead link or redirected). Marking as Dead Link.")
                    try:
                        detail_collection.insert_one({
                            "Property_URL": url,
                            "status": "Dead Link / Redirected",
                            "scraped_date": str(datetime.date.today())
                        })
                    except DuplicateKeyError:
                        pass
                continue

            # -------------------------------------------------
            # Mongo Document
            # -------------------------------------------------
            data = {
                "platform": "housing.com",
                "listing_type": "New Project",
                "category": "Residential",
                "Property_URL": url,
                "project_name": project_name,
                "property_type": property_type,
                "address": address,
                "locality": locality,
                "city": city,
                "state": state,
                "latitude": latitude,
                "longitude": longitude,
                "pincode": pincode,
                "bhk_type": bhk,
                "bedrooms": bedrooms,
                "furnishing_status": furnishing_status,
                "carpet_area": carpet_area,
                "build_up_area": build_up_area,
                "price_per_sqft": price_per_sqft,
                "parsed_price": parsed_price,
                "rera_id": rera_id,
                "posted_date": posted_date,
            }

            updated_date_texts = selector.xpath("//*[contains(text(),'Last updated')]//text()").getall()
            updated_date = "".join(updated_date_texts).replace("Last updated:", "").strip()
            updated_date = updated_date if len(updated_date) <= 40 else ""
            data["updated_date"] = updated_date
            data["scraped_date"] = str(datetime.date.today())
            try:
                detail_collection.insert_one(data)
                print("Inserted Successfully")
            except DuplicateKeyError:
                print("Already Exists")
            except Exception as e:
                print("Mongo Error :", e)
        except Exception as e:
            print("Scraping Error :", e)
        sleep_t = random.uniform(2, 5)
        print(f"Sleeping {sleep_t:.2f} seconds...")
        time.sleep(sleep_t)
    page.quit()


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
