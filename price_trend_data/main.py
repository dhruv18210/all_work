import csv
import json
import re


# Load locality master
localities = {}

with open("locality_master_batch2.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        localities[row["locality_name"].lower()] = row


def get_locality(name):
    name = name.lower()

    for locality, data in localities.items():
        if locality in name or name in locality:
            return data

    return None


def extract_property(filename, property_id):

    with open(filename, encoding="utf-8") as f:
        html = f.read()

    scripts = re.findall(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        html,
        re.DOTALL
    )

    product = {}
    residence = {}
    faq = {}

    for script in scripts:
        try:
            data = json.loads(script)

            if data.get("@type") == "Product":
                product = data

            elif data.get("@type") == "Residence":
                residence = data

            elif data.get("@type") == "FAQPage":
                faq = data

        except:
            continue

    # Basic details
    name = product.get("name", "")
    description = product.get("description", "").lower()

    price = product.get("offers", {}).get("lowPrice", "0")
    rating = product.get("aggregateRating", {}).get("ratingValue", "0")

    # Locality
    locality_name = residence.get("address", {}).get("addressLocality", "")
    locality = get_locality(locality_name)

    if not locality:
        locality = {
            "locality_id": "LOC0000",
            "locality_name": locality_name,
            "city": "Ahmedabad",
            "zone": "West",
            "latitude": "0",
            "longitude": "0"
        }

    # Property type
    property_type = "Apartment"

    if "villa" in description:
        property_type = "Villa"
    elif "bungalow" in description:
        property_type = "Bungalow"

    # BHK
    bhk = "3"

    for q in faq.get("mainEntity", []):
        match = re.search(r"(\d+)\s*BHK", str(q), re.I)

        if match:
            bhk = match.group(1)
            break

    # Status
    status = (
        "Under Construction"
        if "under construction" in description
        else "Ready to Move"
    )

    # Area
    area = re.search(r"(\d+)\s*(?:sq\.?\s*ft\.?|sqft)", html, re.I)

    built_up_area = area.group(1) if area else "NA"
    carpet_area = str(int(int(built_up_area) * 0.7)) if built_up_area != "NA" else "NA"

    # Furnishing
    match = re.search(
        r"(Unfurnished|Semi-Furnished|Furnished|Fully Furnished)",
        html,
        re.I
    )
    furnishing = match.group(1).title() if match else "Unfurnished"

    # Facing
    match = re.search(r"(East|West|North|South)[-\s]?Facing", html, re.I)
    facing = match.group(1).title() if match else "NA"

    # Floors
    match = re.search(r"(\d+)\s*Floors", html, re.I)
    total_floors = match.group(1) if match else "NA"

    # Parking
    parking = "Yes" if "parking" in html.lower() else "No"

    # Price per sqft
    price_per_sqft = "0"

    if price != "0" and built_up_area != "NA":
        price_per_sqft = str(
            int(float(price) / int(built_up_area))
        )

    return {
        "property_id": property_id,
        "locality_id": locality["locality_id"],
        "locality_name": locality["locality_name"],
        "city": locality["city"],
        "zone": locality["zone"],
        "latitude": locality["latitude"],
        "longitude": locality["longitude"],
        "category": "Residential Buy",
        "property_type": property_type,
        "bhk": bhk,
        "carpet_area_sqft": carpet_area,
        "built_up_area_sqft": built_up_area,
        "price_per_sqft": price_per_sqft,
        "total_price": price,
        "floor": "0",
        "total_floors": total_floors,
        "property_age": "New (0-1 yr)" if status == "Ready to Move" else status,
        "furnishing": furnishing,
        "facing": facing,
        "parking": parking,
        "ownership_type": "Freehold",
        "amenities_score": str(int(float(rating) * 2)) if rating != "0" else "5",
        "listing_type": "Sale",
        "status": status,
        "listed_date": "2026-09-07"
    }


# Files
files = [
    "amara_shilaj.html",
    "happy_shela.html",
    "swagat_satelight.html",
    "arohi_satelight.html",
    "venus-satellite.html",
    "goyal-shilaj.html",
    "sharanya-shilaj.html",
    "venus-shela.html",
    "vishwanath-shela.html"

]

fieldnames = [
    "property_id", "locality_id", "locality_name", "city", "zone",
    "latitude", "longitude", "category", "property_type", "bhk",
    "carpet_area_sqft", "built_up_area_sqft", "price_per_sqft",
    "total_price", "floor", "total_floors", "property_age",
    "furnishing", "facing", "parking", "ownership_type",
    "amenities_score", "listing_type", "status", "listed_date"
]


# Create CSV
with open("properties.csv", "w", newline="", encoding="utf-8") as f:

    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()

    for i, filename in enumerate(files):
        row = extract_property(filename, f"PROP0100{i}")
        writer.writerow(row)

print("CSV created successfully!")

