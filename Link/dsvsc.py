import pandas as pd
import requests
from lxml import html
from urllib.parse import urljoin
from pymongo import MongoClient
import re


df = pd.read_csv("project.csv")

collection = MongoClient(
    "mongodb://localhost:27017/"
)["RealEstate"]["99acres_links"]


headers = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/153.0.0.0 Safari/537.36"
    )
}


def clean(text):
    return re.sub(
        r"[^a-z0-9]",
        "",
        str(text).lower()
    )


url = (
    "https://www.99acres.com/search/property/"
    "buy/ahmedabad?city=45&preference=S&res_com=R"
)

response = requests.get(
    url,
    headers=headers,
    timeout=30
)

print("Status:", response.status_code)

tree = html.fromstring(response.content)

links = tree.xpath("//a/@href")

project_links = set()


# Extract all npxid links
for link in links:

    full_url = urljoin(
        "https://www.99acres.com",
        link
    )

    full_url = full_url.split("?")[0]

    if "npxid-" in full_url.lower():
        project_links.add(full_url)


print("99acres links:", len(project_links))


# --------------------------------------------------
# Match every CSV project
# --------------------------------------------------

for _, row in df.iterrows():

    project = str(row["name"]).strip()
    location = str(row["location"]).strip()

    project_clean = clean(project)

    property_link = None


    for link in project_links:

        # Get URL slug
        slug = link.split("99acres.com/")[-1]

        slug_clean = clean(slug)

        if project_clean in slug_clean:
            property_link = link
            break


    collection.insert_one({
        "project": project,
        "location": location,
        "property_link": property_link
    })


    if property_link:

        print(
            "FOUND:",
            project,
            "->",
            property_link
        )

    else:

        print(
            "NOT FOUND:",
            project
        )