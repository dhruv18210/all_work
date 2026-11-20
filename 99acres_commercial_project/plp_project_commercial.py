from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from pymongo.errors import DuplicateKeyError
import time

from config import plp_collection



options = Options()
options.add_argument("--start-maximized")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

driver = webdriver.Chrome(options=options)

driver.execute_script("""
Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined
})
""")

wait = WebDriverWait(driver, 20)


search_params = "ahmedabad"

MAX_PAGES = 99

BASE_URLS = [
    f"https://www.99acres.com/new-commercial-projects-in-{search_params}-ffid-page-"
]

seen_links = set()
total_links = 0

for base_url in BASE_URLS:

    print("=" * 100)
    print(base_url)
    print("=" * 100)

    for page in range(1, MAX_PAGES + 1):

        url = f"{base_url}{page}"

        print(f"\nOpening Page {page}")
        print(url)

        driver.get(url)

        try:
            wait.until(EC.presence_of_all_elements_located((By.XPATH,'//div[@class="NPSRP__contentWrap"]//div[@class="NPSRP__npsrpTuplesContainer"]/div/a')))

        except TimeoutException:
            print("No listing found.")
            break

        cards = driver.find_elements(
            By.XPATH,'//div[@class="NPSRP__contentWrap"]//div[@class="NPSRP__npsrpTuplesContainer"]/div/a')

        if not cards:
            print("No listings found.")
            break

        inserted = 0

        for card in cards:

            href = card.get_attribute("href")

            if not href:
                continue

            href = href.split("?")[0]

            if href in seen_links:
                continue

            seen_links.add(href)

            try:

                plp_collection.insert_one({

                    "property_url": href,
                    "page": page,
                    "source_url": url,
                    "city": search_params,
                    "status": "Pending"

                })

                inserted += 1
                total_links += 1

                print("Inserted :", href)

            except DuplicateKeyError:

                print("Duplicate :", href)

        print(f"Inserted {inserted} links")

        next_btn = driver.find_elements(By.XPATH,'//div[contains(@class,"Pagination")]//a[contains(.,"Next Page")]')

        if not next_btn:
            print("Last Page Reached")
            break

        time.sleep(2)

driver.quit()

print("=" * 80)
print("SCRAPING COMPLETED")
print("Total Links :", total_links)
print("=" * 80)