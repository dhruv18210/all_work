from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import datetime
import random
import time

client = MongoClient("mongodb://localhost:27017/")
db = client["cera_com"]
collection = db[f"link_{datetime.date.today()}"]
collection.create_index("product_link", unique=True)

# List of root category URLs to start crawling from
ROOT_URLS = [
    "https://www.cera-india.com/cera/sanitaryware",
    "https://www.cera-india.com/cera/faucets-showers",
    "https://www.cera-india.com/cera/shower-partitions",
    "https://www.cera-india.com/cera/vanity-cabinets-mirrors",
    "https://www.cera-india.com/cera/kitchen-sink",
    "https://www.cera-india.com/cera/commercial",
    "https://www.cera-india.com/cera/tiles"
]

def human_delay(a=1000, b=3000):
    time.sleep(random.uniform(a / 1000, b / 1000))

def cera_data():
    visited_categories = set()
    categories_to_visit = ROOT_URLS.copy()
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=False, 
            args=["--disable-blink-features=AutomationControlled"]
        )
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        while categories_to_visit:
            current_url = categories_to_visit.pop(0)
            if current_url in visited_categories:
                continue
                
            visited_categories.add(current_url)
            print(f"\n==================================================")
            print(f"Visiting Category: {current_url}")
            print(f"Queue remaining: {len(categories_to_visit)}")
            print(f"==================================================\n")
            
            try:
                page.goto(current_url, wait_until="domcontentloaded", timeout=60000)
                human_delay(2000, 4000)
            except Exception as e:
                print(f"Error loading {current_url}: {e}")
                continue

            # Check if this page has "EXPLORE MORE PRODUCTS"
            # If so, it's a leaf category page containing products
            has_products = page.locator("h4.title a").count() > 0
            
            if has_products:
                print("Found products! Loading all products on this page...")
                while True:
                    next_btn = page.locator("text=EXPLORE MORE PRODUCTS")
                    if next_btn.count() == 0 or not next_btn.first.is_visible():
                        break
                    
                    try:
                        next_btn.first.scroll_into_view_if_needed()
                        human_delay(500, 1000)
                        next_btn.first.click()
                        page.wait_for_timeout(3000) # wait for products to load
                    except Exception as e:
                        print("Error clicking next button:", e)
                        break
                
                # Scrape all product links on the page
                anchors = page.locator("h4.title a")
                count = anchors.count()
                print(f"Scraping {count} product links...")
                for i in range(count):
                    try:
                        href = anchors.nth(i).get_attribute("href")
                        if href:
                            if href.startswith("/"):
                                href = "https://www.cera-india.com" + href
                            try:
                                collection.insert_one({"product_link": href})
                            except DuplicateKeyError:
                                pass
                    except Exception as e:
                        pass
                        
            # Also look for subcategories on the page to crawl deeper.
            # Pages without products often have a list of subcategories
            links = page.locator("a").all()
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if href and href.startswith("/"):
                        full_url = "https://www.cera-india.com" + href
                        
                        # We only want to enqueue valid Cera paths that are deeper in the category tree
                        if "/cera/" in href:
                            # Avoid appending product links as category links, filter out anything not looking like a directory
                            if full_url not in visited_categories and full_url not in categories_to_visit:
                                # Simple heuristic: Check if it's a sub-path of one of the ROOT_URLS
                                is_sub_path = any(full_url.startswith(root) for root in ROOT_URLS)
                                # And check that it doesn't look like a product page (which usually don't have sub-categories)
                                # Although we already handled products, we don't want to crawl them as categories
                                if is_sub_path and len(full_url.split('/')) <= 8:
                                    categories_to_visit.append(full_url)
                except Exception:
                    pass

        print("\nFinished crawling all categories and scraping products.")
        browser.close()

if __name__ == "__main__":
    cera_data()
