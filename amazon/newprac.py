from playwright.sync_api import sync_playwright
import requests
from pymongo import MongoClient
from dateutil.relativedelta import relativedelta
from urllib.parse import urlparse, parse_qs
import re
import time

# client = MongoClient("")
# db = client[""]
# collection = db[""]

keyword = input("enter your keywords: ")

base_url = "https://www.amazon.in/"


def clean_text(node):
    if node:
        return node.text(strip=True)
    return ""


def function_name():
    with sync_playwright() as p:
        browse = p.chromium.launch(
            channel="chrome",
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-infobars",
            ]
        )
        context = browse.new_context()
        page = context.new_page()
        page.goto("https://www.amazon.in/", wait_until="domcontentloaded")
        page.wait_for_timeout(1000)
        search = page.locator("//input[@id='twotabsearchtextbox']")
        search.wait_for(state="visible", timeout=5000)
        search.click()
        search.fill(keyword)
        search.press("Enter")
        time.sleep(3)

        container = page.locator("//div[@class='sg-col-inner']").all()
        for data in container:
            link = data.locator("a.a-link-normal.s-line-clamp-2").first
            if link.count() == 0:
                continue
            url = link.get_attribute("href")
            if url:
                if url.startswith("/sspa"):
                    product_link = "https://www.amazon.in" + url
                else:
                    product_link = url
                print(product_link)
                page.goto(product_link, wait_until="domcontentloaded")
                page.wait_for_timeout(3000)
                break

        breadcrumb = page.locator("//div[@id='wayfinding-breadcrumbs_feature_div']").inner_text().strip()
        breadcrumbs = [
            item.strip()
            for item in breadcrumb.split("\n")
            if item.strip() and item.strip() != "›"
        ]

        title = page.locator("//span[@id='productTitle']").inner_text()
        price = page.locator(
            '(//span[contains(@class,"apex-pricetopay-value")]//span[contains(@class,"a-price-whole")])[1]'
        ).inner_text()
        mrp = page.locator(
            '(//span[contains(@class,"apex-basisprice-value")]//span[contains(@class,"a-offscreen")])[1]'
        ).inner_text()
        discount = page.locator(
            '(//span[contains(@class,"reinventPriceSavingsPercentageMargin")])[1]'
        ).inner_text()

        availability = page.locator('//span[contains(@class, "primary-availability-message")]').inner_text()

        table = page.locator("//table[contains(@class,'a-normal') and contains(@class,'a-spacing-micro')]")
        rows = table.locator("tr")
        key_data = {}
        for i in range(rows.count()):
            row = rows.nth(i)
            tds = row.locator("td")
            if tds.count() >= 2:
                key = tds.nth(0).inner_text().strip()
                value = tds.nth(1).inner_text().strip()
                key_data[key] = value

        description = page.locator("//div[@id='feature-bullets']//li/span")

        data = {
            "product_link": product_link,
            "breadcrumbs": breadcrumbs,
            "title": title,
            "price": price,
            "mrp": mrp,
            "discount": discount,
            "availability": availability,
            "key_data": key_data,
            "description": description
        }
        print(data)
        print("hello")


function_name()

