import re
import requests
from selectolax.parser import HTMLParser
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

client = MongoClient("mongodb://localhost:27017/")
db = client["amazon"]
link_collection = db["product_links_3"]
detail_collection = db["mobdetails"]
detail_collection.create_index("product_link", unique=True)


def get_text(soup, css):
    node = soup.css_first(css)
    if node:
        return node.text(strip=True)
    return ""


def scrape_data(url):
    try:
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
            "Accept-Language": "en-IN,en;q=0.9"
        })
        response = session.get(url, timeout=30)
        response.raise_for_status()
        tree = HTMLParser(response.text)
        if "validateCaptcha" in response.text or "Continue shopping" in response.text:
            print("Blocked by Amazon")
            return
        # with open("laptop11.html", "w", encoding="utf-8") as f:
        #     f.write(response.text)
        title = get_text(tree, "#productTitle")

        rating = ""
        node = tree.css_first("#acrPopover")
        if node:
            rating = node.attributes.get("title", "").strip()
        if rating:
            rating = rating.split(" out")[0]

        selling_price = (
                get_text(tree, ".apexPriceToPay .a-offscreen")
                or get_text(tree, ".reinventPricePriceToPayMargin .a-offscreen")
                or get_text(tree, ".a-price.aok-align-center .a-offscreen")
                or get_text(tree, ".a-price .a-offscreen")
        )
        mrp = (
                get_text(tree, ".basisPrice .a-offscreen")
                or get_text(tree, ".a-text-price .a-offscreen")
        )
        discount = (
                get_text(tree, ".savingsPercentage")
                or get_text(tree, ".reinventPriceSavingsPercentageMargin")
        )

        available = get_text(tree, "#availability span").lower()
        if not available:
            if tree.css_first("#add-to-cart-button"):
                availability = "Yes"
            else:
                availability = "No"
        else:
            if any(text in available for text in ["in stock", "only", "left in stock", "available"]):
                availability = "Yes"
            else:
                availability = "No"

        key_data = []
        for row in tree.css("#productOverview_feature_div tr"):
            cols = row.css("td")
            if len(cols) >= 2:
                key_data.append({
                    cols[0].text(strip=True):
                        cols[1].text(strip=True)
                })

        description = []
        for li in tree.css("#feature-bullets li"):
            txt = li.text(strip=True)
            if txt:
                txt = txt.replace("☆", "")
                txt = re.sub(r'^[^\w【]+', '', txt)
                txt = re.sub(r"[【】]", "", txt)
                txt = txt.replace(":-", ":")
                txt = re.sub(r"\s+", " ", txt).strip()
                description.append(txt)

        images = []
        for img in tree.css("#altImages img"):
            src = img.attributes.get("src")
            if src:
                src = re.sub(r"\._.*?_\.", ".", src)
                images.append(src)
        images = list(dict.fromkeys(images))

        colours = []
        selectors = [
            "#inline-twister-row-color_name li",
            "#variation_color_name li",
            "li[data-csa-c-type='item']"
        ]
        for selector in selectors:
            for li in tree.css(selector):
                colour = (
                        li.attributes.get("aria-label")
                        or li.attributes.get("title")
                )
                if colour and colour not in colours:
                    colours.append(colour.strip())
        if not colours:
            for h3 in tree.css("h3"):
                if h3.text(strip=True).lower() == "colour":
                    ul = h3.next
                    while ul and ul.tag != "ul":
                        ul = ul.next
                    if ul:
                        for li in ul.css("li"):
                            colour = li.text(strip=True)
                            if colour and colour not in colours:
                                colours.append(colour)
                    break

            data = {
                "product_link": url,
                "product_title": title,
                "rating": rating,
                "selling_price": selling_price,
                "MRP": mrp,
                "discount": discount,
                "availability": availability,
                "key_data": key_data,
                "description": description,
                "product_all_images": images,
                "colour_variant": colours
            }
            try:
                detail_collection.insert_one(data)
                print("Saved:", url)
            except DuplicateKeyError:
                print("Already Exists:", url)
    except Exception as e:
        print("Error:", url, e)


def scrape_page():
    print("Loading scraped URLs...")
    scraped_urls = set(doc["product_link"] for doc in detail_collection.find({}, {"product_link": 1, "_id": 0}))
    total = link_collection.count_documents({})
    remaining = total - len(scraped_urls)
    print(f"Total Links      : {total}")
    print(f"Already Scraped  : {len(scraped_urls)}")
    print(f"Remaining        : {remaining}")
    count = 0
    for doc in link_collection.find({}, {"product_link": 1, "_id": 0}):
        url = doc["product_link"]
        if url in scraped_urls:
            continue
        scrape_data(url)
        count += 1
    print(f"Progress : {len(scraped_urls) + count}/{total}")


scrape_page()
