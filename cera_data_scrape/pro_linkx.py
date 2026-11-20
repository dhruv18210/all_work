from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import datetime

# ----------------------------
# MongoDB Connection
# ----------------------------
client = MongoClient("mongodb://localhost:27017/")
db = client["cera_com"]
collection = db[f"cera_sant_link_{datetime.date.today()}"]
collection.create_index("url", unique=True)

# ----------------------------
# Request Headers
# ----------------------------
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    )
}
ROOT_URLS = [
    "https://www.cera-india.com/cera/sanitaryware",
    "https://www.cera-india.com/cera/faucets-showers/faucets",
    "https://www.cera-india.com/cera/wellness/shower-partitions",
    "https://www.cera-india.com/cera/vanity-cabinets-and-mirrors",
    "https://www.cera-india.com/cera/kitchen-sinks",
    "https://www.cera-india.com/cera/commercial",
    "https://www.cera-india.com/cera/tiles"
]


def cera_scrap():
    for page_url in ROOT_URLS:
        print(f"\nScraping : {page_url}")
        try:
            response = requests.get(
                page_url,
                headers=HEADERS,
                timeout=30
            )
            response.raise_for_status()
        except Exception as e:
            print("Request Failed :", e)
            continue
        soup = BeautifulSoup(response.text, "lxml")
        h3_tags = soup.find_all("h3")
        print("Total <h3> tags :", len(h3_tags))
        inserted = 0
        for h3 in h3_tags:
            a_tag = h3.find("a")
            if not a_tag:
                continue
            href = a_tag.get("href")
            full_url = urljoin(page_url, href)
            if "cera-india.com" not in full_url:
                continue
            title = a_tag.get_text(strip=True)
            try:
                collection.insert_one({"title": title, "url": full_url})
                inserted += 1
                print(title)
                print(full_url)
                print("-" * 80)
            except DuplicateKeyError:
                pass
        print(f"Inserted : {inserted}")


cera_scrap()
