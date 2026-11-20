from playwright.sync_api import sync_playwright
from openpyxl import Workbook


def extract():
    with sync_playwright() as p:
        browse = p.chromium.launch(headless=True)
        context = browse.new_context()
        page = context.new_page()
        page.goto("https://quotes.toscrape.com")
        wb = Workbook()
        ws = wb.active
        ws.append([
            "Quote",
            "Author",
            "About",
            "Tags"
        ])
        print("\n-------------------------------------------------------------- Quotes & Author Data --------------------------------------------------------------")
        for page_number in range(3):
            print(f"\nPage {page_number + 1}")
            quotes = page.locator("//div[@class='quote']")
            count = quotes.count()
            print("=" * 50)
            print("Quotes & Author names are:")
            print("=" * 50)
            for i in range(count):
                quote = quotes.nth(i)
                text = quote.locator("//span[@class='text']").inner_text()
                author = quote.locator("//small[@class='author']").inner_text()
                about = quote.locator("//a[contains(text(),'about')]").first.get_attribute("href")
                about_link = "https://quotes.toscrape.com/" + about
                tag = quote.locator("//div[@class='tags']//a[@class='tag']").all_inner_texts()
                quote_data = {
                    "Quote": text,
                    "Author": author,
                    "About": about_link,
                    "Tags": tag
                }
                print(quote_data)
                ws.append([
                    quote_data["Quote"],
                    quote_data["Author"],
                    quote_data["About"],
                    ", ".join(quote_data["Tags"])
                ])

            next_button = page.locator("//li[@class='next']/a")

            if next_button.count() > 0:
                next_button.click()
            else:
                break
        wb.save("quotes&author111.xlsx")
        print("quotes&author111.xlsx completely saved")
        # books
        print("\n-------------------------------------------------------------- Books Data --------------------------------------------------------------")
        page.goto("https://books.toscrape.com")
        wb = Workbook()
        ws = wb.active
        ws.append([
            "Title",
            "Price",
            "Rating",
            "Image",
            "Link"
        ])
        for page_number1 in range(3):
            print(f"\nPage {page_number1 + 1}")
            books = page.locator("//article[@class='product_pod']")
            c = books.count()
            print("=" * 50)
            print("Books Details are:")
            print("=" * 50)
            for i in range(c):
                book = books.nth(i)
                title = book.locator("h3 a").get_attribute("title")
                price = book.locator(".price_color").inner_text()
                rating = book.locator(".star-rating").get_attribute("class")
                rating = rating.replace("star-rating ", "")
                image = book.locator("img").get_attribute("src")
                link = book.locator("h3 a").get_attribute("href")
                full_link1 = "https://books.toscrape.com/" + link
                rating_map = {
                    "One": 1,
                    "Two": 2,
                    "Three": 3,
                    "Four": 4,
                    "Five": 5
                }
                num_rate = rating_map[rating]
                book_data = {
                    "Title": title,
                    "Price": price,
                    "Rating": num_rate,
                    "Image": image,
                    "Link": full_link1
                }
                print(book_data)

                ws.append([
                    book_data["Title"],
                    book_data["Price"],
                    book_data["Rating"],
                    book_data["Image"],
                    book_data["Link"]
                ])
            next_button1 = page.locator("//li[@class='next']/a")

            if next_button1.count() > 0:
                next_button1.click()
            else:
                break
        wb.save("book_details111.xlsx")
        print("book_details111.xlsx completely saved")
        context.close()
        browse.close()


extract()











import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import datetime
import time
import random

# ------------------ MongoDB ------------------
client = MongoClient('mongodb://localhost:27017/')
db = client['cera_com']
collection = db[f'link_sat_{datetime.date.today()}']
collection.create_index('product_link', unique=True)

# ------------------ Config ------------------
BASE_URL = 'https://www.cera-india.com'

ROOT_URLS = [
    'https://www.cera-india.com/cera/sanitaryware',
    'https://www.cera-india.com/cera/faucets-showers',
    'https://www.cera-india.com/cera/shower-partitions',
    'https://www.cera-india.com/cera/vanity-cabinets-mirrors',
    'https://www.cera-india.com/cera/kitchen-sink',
    'https://www.cera-india.com/cera/commercial',
    'https://www.cera-india.com/cera/tiles'
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Connection': 'keep-alive'
}


def human_delay(a=1, b=3):
    time.sleep(random.uniform(a, b))


def get_soup(url):
    try:
        print(f'Fetching: {url}')
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'lxml')
    except Exception as e:
        print(f'Error fetching {url}: {e}')
        return None


def save_product_link(href):
    try:
        collection.insert_one({'product_link': href})
        print(f'✓ Saved: {href}')
    except DuplicateKeyError:
        print(f'- Duplicate: {href}')
    except Exception as e:
        print(f'Error saving {href}: {e}')


def extract_product_links(soup):
    links = set()
    # Product cards
    for a in soup.select('h4.title a'):
        href = a.get('href')
        if href:
            links.add(urljoin(BASE_URL, href))
    return links


def find_load_more_link(soup):
    # Try to find the EXPLORE MORE PRODUCTS button/link
    for a in soup.find_all('a', href=True):
        text = a.get_text(' ', strip=True).upper()
        if 'EXPLORE MORE PRODUCTS' in text:
            return urljoin(BASE_URL, a['href'])
    return None


def extract_category_links(soup):
    category_links = set()
    for a in soup.find_all('a', href=True):
        href = a['href'].strip()
        if not href:
            continue
        full_url = urljoin(BASE_URL, href)
        parsed = urlparse(full_url)
        # Stay on same domain
        if parsed.netloc != 'www.cera-india.com':
            continue
        # Only /cera/ paths
        if '/cera/' not in parsed.path:
            continue
        # Avoid files
        if any(parsed.path.lower().endswith(ext) for ext in ['.pdf', '.jpg', '.jpeg', '.png', '.zip']):
            continue
        category_links.add(full_url)
    return category_links


def crawl_category(start_url, visited):
    queue = [start_url]
    while queue:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        soup = get_soup(url)
        if not soup:
            continue
        # Save products
        products = extract_product_links(soup)
        print(f'Found {len(products)} product links')
        for link in products:
            save_product_link(link)
        # Handle load more pages
        next_page = find_load_more_link(soup)
        if next_page and next_page not in visited and next_page not in queue:
            print(f'Found load more page: {next_page}')
            queue.append(next_page)
        # Discover subcategories
        categories = extract_category_links(soup)
        for category in categories:
            if category not in visited and category not in queue:
                queue.append(category)
        print(f'Queue size: {len(queue)}')
        human_delay(1, 2)


def cera_data():
    visited = set()
    for root in ROOT_URLS:
        print('\n' + '=' * 60)
        print(f'Starting root category: {root}')
        print('=' * 60)
        crawl_category(root, visited)
    print('\nFinished crawling all categories and scraping products.')


if __name__ == '__main__':
    cera_data()
