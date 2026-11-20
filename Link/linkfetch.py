import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from pymongo import MongoClient
from urllib.parse import quote_plus
import time

df = pd.read_csv("project.csv")
collection = MongoClient("mongodb://localhost:27017/")["RealEstate"]["99acres_links"]
driver = webdriver.Chrome()

for _, row in df.iterrows():
    project = str(row["name"]).strip()
    location = str(row["location"]).strip()
    query = f"{project} {location} 99acres.com"
    driver.get("https://www.google.com/search?q=" + quote_plus(query))
    time.sleep(3)

    if "google.com/sorry" in driver.current_url:
        input("Solve CAPTCHA and press ENTER...")
    property_link = None
    try:
        # Get first Google search result
        first_result = driver.find_element(By.XPATH,"//div[@id='rso']//a[@href]/@href")
        # Click first result
        first_result.click()
        time.sleep(4)
        # Copy URL after 99acres page opens
        property_link = driver.current_url.split("?")[0]
        # Make sure it is 99acres
        if "99acres.com" not in property_link:
            property_link = None
    except Exception as e:
        print("Error:", e)

    # Save into MongoDB
    collection.insert_one({"project": project, "location": location, "property_link": property_link})
    print(project, "->", property_link)

driver.quit()