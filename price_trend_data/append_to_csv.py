import csv
import json
import re

# Load locality master
localities = {}
with open('locality_master_batch2.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        localities[row['locality_name'].lower()] = row

def get_locality(name):
    for k, v in localities.items():
        if k in name.lower() or name.lower() in k:
            return v
    return None

def extract_from_html(filename, prop_id):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    scripts = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', content, re.DOTALL)
    
    product_data = {}
    residence_data = {}
    faq_data = {}
    
    for s in scripts:
        try:
            data = json.loads(s)
            if '@type' in data:
                if data['@type'] == 'Product': product_data = data
                if data['@type'] == 'Residence': residence_data = data
                if data['@type'] == 'FAQPage': faq_data = data
        except:
            pass
            
    name = product_data.get('name', 'Unknown')
    description = product_data.get('description', '')
    offers = product_data.get('offers', {})
    price = offers.get('lowPrice', '0')
    rating = product_data.get('aggregateRating', {}).get('ratingValue', '0')
    
    loc_name = residence_data.get('address', {}).get('addressLocality', '')
    loc_info = get_locality(loc_name)
    if not loc_info:
        # try from description
        if 'shilaj' in description.lower(): loc_info = get_locality('shilaj')
        elif 'shela' in description.lower(): loc_info = get_locality('shela')
        elif 'satellite' in description.lower(): loc_info = get_locality('satellite')
        
    if not loc_info:
        loc_info = {'locality_id':'LOC0000', 'locality_name':loc_name, 'city':'Ahmedabad', 'zone':'West', 'latitude':'0', 'longitude':'0'}
        
    property_type = 'Apartment'
    if 'villa' in description.lower(): property_type = 'Villa'
    elif 'bungalow' in description.lower(): property_type = 'Bungalow'
    
    bhk = '3'
    # Try to find bhk in faq
    if 'mainEntity' in faq_data:
        for q in faq_data['mainEntity']:
            if 'BHK' in str(q):
                match = re.search(r'(\d)\s*BHK', str(q))
                if match: bhk = match.group(1)
                
    status = 'Under Construction' if 'under construction' in description.lower() else 'Ready to Move'
    
    # NEW EXTRACTIONS FROM HTML TEXT
    # Built up area
    built_up_area_match = re.search(r'(\d+)\s*(?:sq\.ft\.|sqft|sq ft)\s*(?:built-up|Built-up|built up|Built Up|super built up)', content, re.I)
    built_up_area = built_up_area_match.group(1) if built_up_area_match else 'NA'
    
    # Carpet area
    carpet_area_match = re.search(r'(\d+)\s*(?:sq\.ft\.|sqft|sq ft)\s*(?:carpet|Carpet)', content, re.I)
    carpet_area = carpet_area_match.group(1) if carpet_area_match else 'NA'
    
    if built_up_area == 'NA' and carpet_area == 'NA':
        any_area_match = re.search(r'(\d+)\s*sq\.ft\.', content, re.I)
        if any_area_match:
            built_up_area = any_area_match.group(1)
            carpet_area = str(int(int(built_up_area) * 0.7)) # approximate
            
    # Furnishing
    furnishing_match = re.search(r'(Unfurnished|Furnished|Semi-Furnished|Fully Furnished)', content, re.I)
    furnishing = furnishing_match.group(1).title() if furnishing_match else 'Unfurnished'
    
    # Facing
    facing_match = re.search(r'(East|West|North|South)[-\s]?Facing', content, re.I)
    facing = facing_match.group(1).title() if facing_match else 'NA'
    
    # Floors
    floors_match = re.search(r'(\d+)\s*Floors', content, re.I)
    total_floors = floors_match.group(1) if floors_match else 'NA'
    
    # Parking
    parking = 'Yes' if 'parking' in content.lower() else 'No'

    # Price per sqft calc if possible
    price_per_sqft = '0'
    price_per_sqft_match = re.search(r'₹?\s*([\d,]+(?:[kK]|L|Cr)?)\s*(?:per\s*sq\.ft\.|per\s*sqft|/sq\.ft\.|/sqft|/sq ft|/sq\.m\.|/unit|per\s*unit)', content, re.I)
    
    if price_per_sqft_match:
        val_str = price_per_sqft_match.group(1).replace(',', '').upper()
        multiplier = 1
        if 'K' in val_str:
            multiplier = 1000
            val_str = val_str.replace('K', '')
        elif 'L' in val_str:
            multiplier = 100000
            val_str = val_str.replace('L', '')
        try:
            price_per_sqft = str(int(float(val_str) * multiplier))
        except:
            pass
            
    if price_per_sqft == '0' or int(price_per_sqft) < 100:
        if price != '0' and built_up_area != 'NA':
            price_per_sqft = str(int(int(price)/int(built_up_area)))
        else:
            price_per_sqft = '0'
    
    row = {
        'property_id': prop_id,
        'locality_id': loc_info['locality_id'],
        'locality_name': loc_info['locality_name'],
        'city': loc_info['city'],
        'zone': loc_info['zone'],
        'latitude': loc_info['latitude'],
        'longitude': loc_info['longitude'],
        'category': 'Residential Buy',
        'property_type': property_type,
        'bhk': bhk,
        'carpet_area_sqft': carpet_area,
        'built_up_area_sqft': built_up_area,
        'price_per_sqft': price_per_sqft,
        'total_price': price,
        'floor': '0',
        'total_floors': total_floors,
        'property_age': 'New (0-1 yr)' if status == 'Ready to Move' else status,
        'furnishing': furnishing,
        'facing': facing,
        'parking': parking,
        'ownership_type': 'Freehold',
        'amenities_score': str(int(float(rating)*2)) if float(rating) > 0 else '5',
        'listing_type': 'Sale',
        'status': status,
        'listed_date': '2026-09-07'
    }
    return row

files = ['amara_shilaj.html', 'happy_shela.html', 'swagat_satelight.html', "arohi_satelight.html",
    "venus-satellite.html",
    "goyal-shilaj.html",
    "sharanya-shilaj.html",
    "venus-shela.html",
    "vishwanath-shela.html"]
fieldnames = ['property_id','locality_id','locality_name','city','zone','latitude','longitude','category','property_type','bhk','carpet_area_sqft','built_up_area_sqft','price_per_sqft','total_price','floor','total_floors','property_age','furnishing','facing','parking','ownership_type','amenities_score','listing_type','status','listed_date']

csv_filename = 'combined_properties.csv'
try:
    with open(csv_filename, 'w', newline='', encoding='utf-8') as out_f:
        writer = csv.DictWriter(out_f, fieldnames=fieldnames)
        writer.writeheader()
        for i, f in enumerate(files):
            row = extract_from_html(f, f'PROP0100{i}')
            writer.writerow(row)
    print(f'Successfully wrote {csv_filename}')
except PermissionError:
    print(f'Error: Could not write to {csv_filename}. Please close the file if it is open in another program (like Excel).')

print('Finished generating CSV file')
