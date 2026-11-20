import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import datetime
import random
import time
import re
from urllib.parse import urljoin

client = MongoClient("mongodb://localhost:27017/")
db = client["cera_com"]
collection = db[f"test"]
collection.create_index("product_link", unique=True)

ROOT_URLS = [
    "https://www.cera-india.com/cera/sanitaryware",
    "https://www.cera-india.com/cera/faucets-showers",
    "https://www.cera-india.com/cera/wellness/shower-partitions",
    "https://www.cera-india.com/cera/vanity-cabinets-mirrors",
    "https://www.cera-india.com/cera/kitchen-sink",
    "https://www.cera-india.com/cera/commercial",
    "https://www.cera-india.com/cera/tiles"
]

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.cera-india.com/"
}


def human_delay(a=1000, b=3000):
    time.sleep(random.uniform(a / 1000, b / 1000))


def save_links(soup):
    anchors = soup.select("h4.title a")
    for a in anchors:
        href = a.get("href")
        if not href:
            continue
        full = urljoin("https://www.cera-india.com", href)
        try:
            collection.insert_one({"product_link": full})
            print("Saved :", full)
        except DuplicateKeyError:
            pass


def scrape_explore_more(session, category_url, term_id):
    """
    Calls filterproductlist API until Explore More finishes.
    """
    page = 1
    while True:
        print(f"Explore Page : {page}")
        payload = {
            "sort_method": "DESC",
            "term_id": term_id,
            "minprice": "",
            "maxprice": "",
            "explore_more": page,
            "wminsize": "",
            "wmaxsize": "",
            "lminsize": "",
            "lmaxsize": "",
            "hminsize": "",
            "hmaxsize": ""
        }
        r = session.post(
            "https://www.cera-india.com/filterproductlist",
            headers=HEADERS,
            data=payload
        )
        data = r.json()
        html = data.get("html", "")
        if not html:
            print("No HTML Returned")
            break
        soup = BeautifulSoup(html, "html.parser")
        save_links(soup)
        if data.get("explore") != "yes":
            print("Explore Finished")
            break
        page += 1
        human_delay()


def cera_data():
    session = requests.Session()
    visited = set()
    queue = ROOT_URLS.copy()
    while queue:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        print("=" * 80)
        print(url)
        print("=" * 80)
        try:
            response = session.get(url, headers=HEADERS, timeout=30)
        except Exception as e:
            print(e)
            continue
        soup = BeautifulSoup(response.text, "html.parser")
        # Save products available on first page
        save_links(soup)

        html = response.text
        term = re.search(r'term_id["\']?\s*[:=]\s*["\']?(\d+)', html)
        if term:
            term_id = term.group(1)
            print("TERM ID :", term_id)
            scrape_explore_more(session, url, term_id)

        for a in soup.find_all("a", href=True):
            href = a["href"]
            if not href.startswith("/"):
                continue
            full = urljoin("https://www.cera-india.com", href)
            if "/cera/" not in full:
                continue
            if full in visited:
                continue
            if full in queue:
                continue
            queue.append(full)
        human_delay()
    print("Completed")


if __name__ == "__main__":
    cera_data()
