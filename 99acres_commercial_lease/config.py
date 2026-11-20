from datetime import datetime
from pymongo import MongoClient


MAX_PAGES = 99
MAX_WORKERS = 1
MAX_RETRIES = 3
RETRY_DELAY = 5

REQUEST_HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/149.0.0.0 Safari/537.36",
}


MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "99acres_property_lease"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]



now = datetime.now()
week_number = (now.day - 1) // 7 + 1
weekly_date = now.strftime("%d_%m")



INPUT_COLLECTION_NAME = "property_links"
PLP_COLLECTION_NAME = f"plp_lease_fetch_{weekly_date}_{week_number}"
PDP_COLLECTION_NAME = f"pdp_lease_fetch_{weekly_date}_{week_number}"


input_collection = db[INPUT_COLLECTION_NAME]
plp_collection = db[PLP_COLLECTION_NAME]
pdp_collection = db[PDP_COLLECTION_NAME]

plp_collection.create_index("property_url", unique=True)


