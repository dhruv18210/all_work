import json
import re

def extract_all_from_json_string(text):
    data = {}
    
    def get_match(pattern, group=1, default=""):
        m = re.search(pattern, text, re.IGNORECASE)
        return m.group(group).strip() if m else default

    # areaConfig
    area_configs = re.findall(r'"areaConfig"\s*:\s*\[(.*?)\]', text, re.DOTALL | re.IGNORECASE)
    if area_configs:
        config_str = area_configs[0]
        c = re.search(r'"name"\s*:\s*"Carpet Area".*?"value"\s*:\s*([\d\.]+)', config_str, re.DOTALL | re.IGNORECASE)
        b = re.search(r'"name"\s*:\s*"(?:Super )?Builtup Area".*?"value"\s*:\s*([\d\.]+)', config_str, re.DOTALL | re.IGNORECASE)
        data['property_size'] = b.group(1) if b else (c.group(1) if c else "")
        # The user's code previously used property_size for Builtup/Carpet
        
    data['project_area'] = get_match(r'"Project Area"\s*,\s*"value"\s*:\s*"?([\d\.]+\s*(?:Acres|Sq\.m|Sq\.ft)?)"?')
    if not data['project_area']:
        # sometimes it's in projectAttributes
        data['project_area'] = get_match(r'"projectArea"\s*:\s*"([^"]+)"')
        
    data['project_name'] = get_match(r'"projectAttributes"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"')
    if not data['project_name']:
        data['project_name'] = get_match(r'"projectName"\s*:\s*"([^"]+)"')
        
    data['property_subtitle'] = get_match(r'"caption"\s*:\s*"([^"]+)"') # like 3 BHK Apartment, 1761 sq.ft
    data['property_type'] = "Apartment" if "Apartment" in data['property_subtitle'] else "Villa"
    
    data['address'] = get_match(r'"address"\s*:\s*"([^"]+)"')
    data['locality'] = get_match(r'"locality"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"')
    data['city'] = get_match(r'"city"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"')
    data['state'] = get_match(r'"state"\s*:\s*"([^"]+)"')
    data['latitude'] = get_match(r'"latitude"\s*:\s*"([^"]+)"')
    data['longitude'] = get_match(r'"longitude"\s*:\s*"([^"]+)"')
    data['pincode'] = get_match(r'[\s,]+([\d]{6})[\s,]+')
    
    data['builder_name'] = get_match(r'"developer"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"')
    if not data['builder_name']:
        data['builder_name'] = get_match(r'"developerName"\s*:\s*"([^"]+)"')

    data['possession'] = get_match(r'"possessionStatus"\s*:\s*"([^"]+)"')
    data['bhk_type'] = get_match(r'"bhkShortLabel"\s*:\s*"([^"]+)"')
    
    # Try to extract numbers from bhk_type
    if data['bhk_type']:
        bhk_num = re.search(r'\d+', data['bhk_type'])
        data['bedrooms'] = bhk_num.group() if bhk_num else ""
    
    data['bathrooms'] = get_match(r'"name"\s*:\s*"Bathrooms?".*?"value"\s*:\s*"?(\d+)"?')
    data['balconies'] = get_match(r'"name"\s*:\s*"Balcon(?:y|ies)".*?"value"\s*:\s*"?(\d+)"?')
    data['furnishing_status'] = get_match(r'"furnishingStatus"\s*:\s*"([^"]+)"')
    if not data['furnishing_status']:
        data['furnishing_status'] = get_match(r'"name"\s*:\s*"Furnishing".*?"value"\s*:\s*"([^"]+)"')

    data['price_per_sqft'] = get_match(r'"averagePrice"\s*:\s*"([^"]+)"')
    data['parsed_price'] = get_match(r'"price"\s*:\s*\{[^}]*"displayValue"\s*:\s*"([^"]+)"')
    data['security_deposit'] = get_match(r'"securityDeposit"\s*:\s*"([^"]+)"')
    data['rera_id'] = get_match(r'"modifiedReraId"\s*:\s*"([^"]+)"')
    data['posted_date'] = get_match(r'"postedDate"\s*:\s*"([^"]+)"')
    
    print(json.dumps(data, indent=2))

with open('json_parse.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()
extract_all_from_json_string(text)
