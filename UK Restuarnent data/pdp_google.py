import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from urllib.parse import parse_qs, quote, unquote, urlparse

from pymongo import MongoClient, UpdateOne
from pymongo.errors import ConnectionFailure, PyMongoError
import requests

# Ensure UTF-8 output on Windows terminal
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# ─────────────────────────────────────────────────────────────
#  LOGGING CONFIGURATION
# ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("PDP_Google")

# ─────────────────────────────────────────────────────────────
#  CONFIGURATION & CONSTANTS
# ─────────────────────────────────────────────────────────────
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "UK_Restaurant_Data"
LINK_COLLECTION = "Restaurant_link"
DETAILS_COLLECTION = "Restaurant_details"

# Request headers tailored for Google Maps PDP endpoint
HEADERS = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "priority": "u=1, i",
    "referer": "https://www.google.com/",
    "sec-ch-ua": '"Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/154.0.0.0 Safari/537.36"
    ),
    "x-browser-channel": "stable",
    "x-browser-copyright": "Copyright 2026 Google LLC. All Rights Reserved.",
    "x-browser-year": "2026",
}

# Optional cookies if needed (uncomment / supply if hitting consent/auth blocks)
COOKIES = {}

REQUEST_TIMEOUT = 20
PAGE_DELAY = 1.5  # Friendly delay between requests to avoid rate limits


# ─────────────────────────────────────────────────────────────
#  HELPER UTILITIES
# ─────────────────────────────────────────────────────────────
def _safe_get(obj, *keys, default=None):
    """Safely traverse nested lists/dicts without throwing IndexError or KeyError."""
    current = obj
    for k in keys:
        try:
            current = current[k]
        except (IndexError, KeyError, TypeError):
            return default
    return current if current is not None else default


def clean_google_id(value: str) -> str:
    """Normalize internal Google identifiers like 'pv-/g/...' into '/g/...'."""
    if not value:
        return ""
    val = value.strip()
    if val.startswith("pv-"):
        val = val[3:]
    return val


# ─────────────────────────────────────────────────────────────
#  DYNAMIC PAYLOAD BUILDER
# ─────────────────────────────────────────────────────────────
def build_preview_place_url(
    place_id_hex: str,
    google_id: str = "",
    query_str: str = "",
    lat: float = None,
    lng: float = None,
    gl: str = "gb",
    hl: str = "en",
) -> str:
    """
    Dynamically generates the Google Maps preview/place URL with the serialized
    protobuf (pb) payload for Place Details (PDP).
    """
    encoded_hex = quote(place_id_hex)
    encoded_gid = quote(google_id) if google_id else ""
    encoded_q = quote(query_str)

    lat_str = f"{lat:.7f}" if lat is not None else "50.8099639"
    lng_str = f"{lng:.7f}" if lng is not None else "-0.3690611"

    # Google Maps preview place protobuf structure with dynamic parameters
    pb_template = (
        "!1m20!1s{HEX}!3m12!1m3!1d7071.45418048126!2d72.53441735!3d23.1149769"
        "!2m3!1f0!2f0!3f0!3m2!1i1745!2i370!4f13.1!4m2!3d{LAT}!4d{LNG}!5e0!9e0"
        "!11s{GID}!12m4!2m3!1i360!2i120!4i8!13m57!2m2!1i203!2i100!3m2!2i4!5b1!6m6"
        "!1m2!1i86!2i86!1m2!1i408!2i240!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2"
        "!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2"
        "!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!15m8!1m7!1m2!1m1!1e2!2m2"
        "!1i195!2i195!3i20!14m6!1sTCnPat7QJdGv4-EPsovqoQY%3A8!2s1i%3A0%2Ct%3A6986"
        "%2Cp%3ATCnPat7QJdGv4-EPsovqoQY%3A8!7e81!12e15!17sTCnPat7QJdGv4-EPsovqoQY"
        "%3A47!18e3!15m110!1m28!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1"
        "!18m17!3b1!4b1!5b1!6b1!9b1!13b1!14b1!17b1!20b1!21b1!22b1!30b1!32b1"
        "!33m1!1b1!34b1!36e2!10m1!8e3!11m1!3e1!17b1!20m2!1e3!1e6!24b1!25b1!26b1"
        "!27b1!29b1!30m1!2b1!36b1!37b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1"
        "!56m1!1b1!61m2!1m1!1e1!65m5!3m4!1m3!1m2!1i224!2i298!72m22!1m8!2b1!5b1"
        "!7b1!12m4!1b1!2b1!4m1!1e1!4b1!8m10!1m6!4m1!1e1!4m1!1e3!4m1!1e4"
        "!3sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts"
        "!6m1!1e1!9b1!89b1!90m2!1m1!1e2!98m3!1b1!2b1!3b1!103b1!113b1!114m3!1b1"
        "!2m1!1b1!117b1!122m1!1b1!126b1!127b1!128m1!1b1!21m28!1m6!1m2!1i0!2i0"
        "!2m2!1i530!2i370!1m6!1m2!1i1695!2i0!2m2!1i1745!2i370!1m6!1m2!1i0!2i0"
        "!2m2!1i1745!2i20!1m6!1m2!1i0!2i350!2m2!1i1745!2i370!22m1!1e81!29m0!30m6"
        "!3b1!6m1!2b1!7m1!2b1!9b1!34m5!7b1!10b1!14b1!15m1!1b0!37i799!39s{QUERY}"
    )

    pb = pb_template.format(
        HEX=encoded_hex,
        GID=encoded_gid,
        QUERY=encoded_q,
        LAT=lat_str,
        LNG=lng_str,
    )

    return (
        f"https://www.google.com/maps/preview/place?"
        f"authuser=0&hl={hl}&gl={gl}&pb={pb}&q={encoded_q}"
    )


# ─────────────────────────────────────────────────────────────
#  RESOLUTION: FIND HEX PLACE ID & CID
# ─────────────────────────────────────────────────────────────
def cid_to_place_id(session: requests.Session, cid: str) -> tuple[str, str]:
    """Resolve a Google CID to hex place ID (0x...:0x...) and slug."""
    if not cid:
        return "", ""
    try:
        url = f"https://www.google.com/maps?cid={cid}"
        resp = session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if resp.status_code == 200:
            m = re.search(r"(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)", resp.text)
            if not m:
                m = re.search(r"(0x[0-9a-fA-F]+%3A0x[0-9a-fA-F]+)", resp.text, re.I)
                hex_id = unquote(m.group(1)) if m else ""
            else:
                hex_id = m.group(1)

            m_slug = re.search(r"(/g/[a-zA-Z0-9_\-]+)", resp.text)
            slug = m_slug.group(1) if m_slug else ""
            return hex_id, slug
    except Exception as e:
        logger.debug(f"CID resolution failed for {cid}: {e}")
    return "", ""


def resolve_place_id_via_search(
    session: requests.Session, query: str
) -> tuple[str, str, float, float]:
    """
    Search Google Maps (tbm=map) to dynamically obtain the hex place ID,
    CID, and latitude/longitude coordinates.
    """
    url = f"https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=gb&q={quote(query)}"
    try:
        resp = session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        if resp.status_code != 200 or not resp.text:
            return "", "", None, None

        raw = resp.text.strip()
        if raw.startswith(")]}'"):
            raw = raw[4:].strip()

        try:
            data = json.loads(raw)
            item = _safe_get(data, 0, 1, 0, 14)
            if item:
                hex_id = _safe_get(item, 10, default="")
                cid = str(_safe_get(item, 181, 5, default=""))
                lat = _safe_get(item, 9, 2)
                lng = _safe_get(item, 9, 3)
                if hex_id:
                    return hex_id, cid, lat, lng
        except Exception:
            pass

        # Regex fallback from response text
        m_hex = re.findall(r"0x[0-9a-fA-F]+:0x[0-9a-fA-F]+", resp.text)
        m_cid = re.findall(r"cid=(\d+)", resp.text) or re.findall(r'data-ludocid="(\d+)"', resp.text)

        hex_id = m_hex[0] if m_hex else ""
        cid = m_cid[0] if m_cid else ""
        return hex_id, cid, None, None

    except Exception as e:
        logger.warning(f"Map search resolution error for '{query}': {e}")

    return "", "", None, None


# ─────────────────────────────────────────────────────────────
#  RESPONSE PARSER
# ─────────────────────────────────────────────────────────────
def parse_pdp_response(resp_text: str) -> dict:
    """
    Parses the Google Maps preview/place JSON array and extracts all structured
    place details.
    """
    raw = resp_text.strip()
    if raw.startswith(")]}'"):
        raw = raw[4:].strip()

    data = json.loads(raw)
    item = _safe_get(data, 6)
    if not item or not isinstance(item, list):
        return {}

    # Extract opening hours into a clean day-to-time map
    opening_hours = {}
    hours_raw = _safe_get(item, 203, 0)
    if hours_raw and isinstance(hours_raw, list):
        for day_entry in hours_raw:
            if isinstance(day_entry, list) and len(day_entry) > 3:
                day_name = day_entry[0]
                times = []
                if isinstance(day_entry[3], list):
                    for t in day_entry[3]:
                        if isinstance(t, list) and t and isinstance(t[0], str):
                            clean_time = (
                                t[0]
                                .replace("\u202f", " ")
                                .replace("\u2013", "-")
                                .replace("\xa0", " ")
                            )
                            times.append(clean_time)
                opening_hours[day_name] = ", ".join(times) if times else "Closed"

    # Extract phone number
    phone = ""
    phone_data = _safe_get(item, 178, 0, 0)
    if phone_data:
        phone = str(phone_data).strip()

    # Extract website URL
    website = _safe_get(item, 7, 0, default="")

    # Extract ratings & review count
    rating = _safe_get(item, 4, 7)
    review_count = _safe_get(item, 4, 8)

    # Extract latitude & longitude
    lat = _safe_get(item, 9, 2)
    lng = _safe_get(item, 9, 3)

    # Extract categories and join with pipe separator ' | '
    raw_categories = _safe_get(item, 13, default=[])
    categories_list = []
    if isinstance(raw_categories, list):
        for c in raw_categories:
            if isinstance(c, str) and c.strip():
                categories_list.append(c.strip())
            elif isinstance(c, list):
                for sub in c:
                    if isinstance(sub, str) and sub.strip():
                        categories_list.append(sub.strip())

    categories_pipe = " | ".join(categories_list) if categories_list else ""

    return {
        "restaurant_name": _safe_get(item, 11, default=""),
        "place_id_hex": _safe_get(item, 10, default=""),
        "google_id": _safe_get(item, 89, default=""),
        "google_cid": str(_safe_get(item, 181, 5, default="")),
        "full_address": _safe_get(item, 18, default=""),
        "street_address": _safe_get(item, 39, default=""),
        "rating": float(rating) if rating is not None else None,
        "reviews_count": int(review_count) if review_count is not None else None,
        "categories": categories_pipe,
        "website": website,
        "phone_number": phone,
        "latitude": float(lat) if lat is not None else None,
        "longitude": float(lng) if lng is not None else None,
        "google_maps_url": _safe_get(item, 42, default=""),
        "opening_hours": opening_hours,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


# ─────────────────────────────────────────────────────────────
#  MAIN PROCESSING PIPELINE
# ─────────────────────────────────────────────────────────────
def fetch_restaurant_pdp_data(
    mongo_uri: str = MONGO_URI,
    limit: int = 0,
    force_rescrape: bool = False,
):
    """
    Fetches restaurant links from MongoDB, resolves place identifiers, dynamically
    generates PDP requests, extracts rich details, and saves them to MongoDB.
    """
    try:
        mongo = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        mongo.admin.command("ping")
        db = mongo[DB_NAME]
        links_collection = db[LINK_COLLECTION]
        details_collection = db[DETAILS_COLLECTION]

        # Ensure unique index on details and links
        links_collection.create_index("restaurant_link", unique=True)
        details_collection.create_index("place_id_hex", unique=True, sparse=True)
        details_collection.create_index("restaurant_link")
        logger.info(f"Connected to MongoDB database: '{DB_NAME}'")
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return

    # Build query filter: process pending items first unless force_rescrape is True
    query_filter = {} if force_rescrape else {"pdp_status": {"$ne": "DONE"}}
    total_docs = links_collection.count_documents(query_filter)
    logger.info(f"Found {total_docs} restaurant(s) to process (Filter: {query_filter})")

    cursor = links_collection.find(query_filter)
    if limit > 0:
        cursor = cursor.limit(limit)

    session = requests.Session()
    processed = 0
    succeeded = 0
    failed = 0

    try:
        for doc in cursor:
            processed += 1
            name = doc.get("restaurant_name", "").strip()
            address = doc.get("restaurant_address", "").strip()
            rest_link = doc.get("restaurant_link", "").strip()
            google_id = clean_google_id(doc.get("google_internal_id", ""))
            google_cid = doc.get("google_cid", "").strip()
            place_id_hex = doc.get("place_id_hex", "").strip()

            search_query = f"{name}, {address}, UK".strip(" ,")
            logger.info(f"[{processed}/{total_docs}] Processing: '{name}' ({address})")

            # ─────────────────────────────────────────────
            # 1. Resolve Hex Place ID if missing
            # ─────────────────────────────────────────────
            lat, lng = None, None
            if not place_id_hex:
                if google_cid:
                    place_id_hex, _ = cid_to_place_id(session, google_cid)

                if not place_id_hex:
                    place_id_hex, cid_found, lat, lng = resolve_place_id_via_search(
                        session, search_query
                    )
                    if cid_found and not google_cid:
                        google_cid = cid_found

            if not place_id_hex:
                logger.warning(f"  -> Could not resolve place_id_hex for '{name}'. Skipping.")
                links_collection.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"pdp_status": "FAILED_RESOLVE", "error": "No Hex ID found"}},
                )
                failed += 1
                time.sleep(PAGE_DELAY)
                continue

            logger.info(f"  -> Hex ID: {place_id_hex} | CID: {google_cid or 'N/A'}")

            # ─────────────────────────────────────────────
            # 2. Build Dynamic PDP URL & Execute Request
            # ─────────────────────────────────────────────
            pdp_url = build_preview_place_url(
                place_id_hex=place_id_hex,
                google_id=google_id,
                query_str=search_query,
                lat=lat,
                lng=lng,
            )

            try:
                resp = session.get(pdp_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
                if resp.status_code == 429:
                    logger.warning(f"  -> Rate limit (HTTP 429) hit! Sleeping for 25s...")
                    time.sleep(25)
                    continue

                if resp.status_code != 200 or len(resp.text) < 500:
                    logger.warning(
                        f"  -> Bad response for '{name}' (HTTP {resp.status_code}, length {len(resp.text)})"
                    )
                    links_collection.update_one(
                        {"_id": doc["_id"]},
                        {"$set": {"pdp_status": f"HTTP_{resp.status_code}"}},
                    )
                    failed += 1
                    time.sleep(PAGE_DELAY)
                    continue

                # ─────────────────────────────────────────
                # 3. Parse Place Details
                # ─────────────────────────────────────────
                details = parse_pdp_response(resp.text)
                if not details or not details.get("restaurant_name"):
                    logger.warning(f"  -> Could not parse valid details for '{name}'")
                    links_collection.update_one(
                        {"_id": doc["_id"]},
                        {"$set": {"pdp_status": "PARSE_ERROR"}},
                    )
                    failed += 1
                    time.sleep(PAGE_DELAY)
                    continue

                # Ensure place_id_hex is populated
                key_id = details.get("place_id_hex") or place_id_hex
                details["place_id_hex"] = key_id

                # Merge reference data
                details["original_restaurant_link"] = rest_link
                details["search_keyword"] = doc.get("search_keyword", "")

                # ─────────────────────────────────────────
                # 4. Save to MongoDB
                # ─────────────────────────────────────────
                # Upsert into Restaurant_details collection
                details_collection.update_one(
                    {"place_id_hex": key_id},
                    {"$set": details},
                    upsert=True,
                )

                # Update link document status in Restaurant_link
                links_collection.update_one(
                    {"_id": doc["_id"]},
                    {
                        "$set": {
                            "pdp_status": "DONE",
                            "place_id_hex": place_id_hex,
                            "google_cid": details.get("google_cid") or google_cid,
                            "pdp_scraped_at": datetime.now(timezone.utc).isoformat(),
                        }
                    },
                )

                rating_str = f"{details['rating']}*" if details["rating"] else "No rating"
                reviews_str = f"({details['reviews_count']} reviews)" if details["reviews_count"] else ""
                phone_str = details["phone_number"] or "No phone"
                logger.info(
                    f"  -> Saved: {details['restaurant_name']} | {rating_str} {reviews_str} | Phone: {phone_str}"
                )
                succeeded += 1

            except Exception as exc:
                logger.error(f"  -> Request error for '{name}': {exc}")
                links_collection.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"pdp_status": "ERROR", "error": str(exc)}},
                )
                failed += 1

            time.sleep(PAGE_DELAY)

    except KeyboardInterrupt:
        logger.info("\nInterrupted by user. Exiting gracefully...")
    finally:
        session.close()
        mongo.close()
        logger.info(
            f"\nFinished run: Processed={processed}, Succeeded={succeeded}, Failed={failed}"
        )


# ─────────────────────────────────────────────────────────────
#  ENTRYPOINT
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Run PDP scraper on restaurants from MongoDB
    fetch_restaurant_pdp_data(
        mongo_uri=MONGO_URI,
        limit=0,              # Set to e.g. 10 for testing, or 0 to process all records
        force_rescrape=False  # Skips restaurants already marked as 'DONE'
    )