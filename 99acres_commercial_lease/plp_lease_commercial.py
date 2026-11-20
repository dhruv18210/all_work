from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import time


from config import plp_collection



options = Options()
options.add_argument("--start-maximized")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches",["enable-automation"])
options.add_experimental_option("useAutomationExtension",False)
driver = webdriver.Chrome(options=options)
driver.execute_script("""Object.defineProperty(navigator,'webdriver',{get:()=>undefined})""")

wait = WebDriverWait(driver,20)

# options = Options()
#
# options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
#
# options.add_argument("--start-maximized")
#
# options.add_argument(
#     r"--user-data-dir=C:\Users\Go Go Trips\AppData\Local\Google\Chrome\User Data"
# )
#
# options.add_argument("--profile-directory=Profile 11")
#
# # Add all options BEFORE creating the driver
# options.add_argument("--disable-blink-features=AutomationControlled")
# options.add_experimental_option(
#     "excludeSwitches", ["enable-automation"]
# )
# options.add_experimental_option(
#     "useAutomationExtension", False
# )
#
# driver = webdriver.Chrome(options=options)
# wait = WebDriverWait(driver, 20)


search_params = "ahmedabad"

MAX_PAGES = 99
BASE_URLS = [
        f'https://www.99acres.com/commercial-property-for-rent-in-{search_params}-ffid-page-',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_max=7&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=6&budget_max=8&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=118&budget_max=9&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=9&budget_max=10&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=10&budget_max=125&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=125&budget_max=127&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=127&budget_max=13&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=13&budget_max=138&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=137&budget_max=148&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=148&budget_max=158&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=158&budget_max=17&page=',
        f'https://www.99acres.com/search/property/lease/{search_params}?keyword={search_params}&preference=L&res_com=C&isPreLeased=N&budget_min=17&budget_max=28&page='
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
        time.sleep(3)
        try:
            wait.until(EC.presence_of_all_elements_located((By.XPATH,'//a[@class="ellipsis" or @class="tupleNew__propertyHeading ellipsis"]')))
        except TimeoutException:
            print("No listing found.")
            break

        cards = driver.find_elements(By.XPATH,'//a[@class="ellipsis" or @class="tupleNew__propertyHeading ellipsis"]')
        if len(cards) == 0:
            print("No property found.")
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
                    "status": "Pending"})

                inserted += 1
                total_links += 1
                print("Inserted :", href)
            except DuplicateKeyError:
                    print("Duplicate :", href)

        print(f"Inserted {inserted} links")
        next_btn = driver.find_elements(By.XPATH,"//a[contains(text(),'Next Page')]")
        if len(next_btn) == 0:
            print("Last Page Reached")
            break

        time.sleep(2)

driver.quit()

print("=" * 80)
print("SCRAPING COMPLETED")
print("Total Links :", total_links)
print("=" * 80)