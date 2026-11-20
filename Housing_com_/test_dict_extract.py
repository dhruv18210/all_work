import json

def extract_from_state(state):
    data = {}
    
    # helper to find keys recursively
    def find_key(obj, key):
        if isinstance(obj, dict):
            if key in obj: return obj[key]
            for v in obj.values():
                res = find_key(v, key)
                if res is not None: return res
        elif isinstance(obj, list):
            for item in obj:
                res = find_key(item, key)
                if res is not None: return res
        return None

    # areaConfig
    area_config = find_key(state, 'areaConfig')
    if area_config and isinstance(area_config, list):
        for ac in area_config:
            name = ac.get('name', '')
            val = ac.get('areaInfo', {}).get('value', '')
            if 'Carpet' in name:
                data['carpet_area'] = str(val)
            elif 'Builtup' in name:
                data['builtup_area'] = str(val)
                
    # property_size / project_area
    if data.get('builtup_area'):
        data['property_size'] = data['builtup_area']
    elif data.get('carpet_area'):
        data['property_size'] = data['carpet_area']
        
    data['project_area'] = find_key(state, 'projectArea') or ""
    
    # project_name
    proj_attrs = find_key(state, 'projectAttributes')
    if proj_attrs and isinstance(proj_attrs, dict):
        data['project_name'] = proj_attrs.get('name', '')
    if not data.get('project_name'):
        data['project_name'] = find_key(state, 'projectName') or ""
        
    # property_subtitle
    data['property_subtitle'] = find_key(state, 'caption') or ""
    data['property_type'] = "Apartment" if "Apartment" in data['property_subtitle'] else "Villa"
    
    # Address / Locality / City
    geo = find_key(state, 'geo') or {}
    if geo:
        data['latitude'] = geo.get('latitude', '')
        data['longitude'] = geo.get('longitude', '')
        data['address'] = geo.get('address', '')
    
    city_obj = find_key(state, 'city')
    if isinstance(city_obj, dict):
        data['city'] = city_obj.get('name', '')
        
    # Pincode
    faqs = find_key(state, 'dedicatedFaqs') or []
    for faq in faqs:
        a = faq.get('a', '')
        import re
        m = re.search(r'\b\d{6}\b', a)
        if m:
            data['pincode'] = m.group()
            break
            
    # builder_name
    developer = find_key(state, 'developer') or {}
    data['builder_name'] = developer.get('name', '')
    
    # possession
    data['possession'] = find_key(state, 'possessionStatus') or ""
    
    # bhk_type
    data['bhk_type'] = find_key(state, 'bhkShortLabel') or ""
    if data['bhk_type']:
        import re
        m = re.search(r'\d+', data['bhk_type'])
        if m: data['bedrooms'] = m.group()
        
    # price
    price_obj = find_key(state, 'price') or {}
    data['parsed_price'] = price_obj.get('displayValue', '')
    data['price_per_sqft'] = find_key(state, 'averagePrice') or ""
    
    # rera
    data['rera_id'] = find_key(state, 'modifiedReraId') or ""
    
    # posted date
    data['posted_date'] = find_key(state, 'postedDate') or ""
    
    return data

# Test it
import json
with open('json_parse.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()
# Let's fix the invalid JSON first to test the dict parsing
text = text.replace('""Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24""', '"Google Chrome"')
try:
    state = json.loads(text)
    data = extract_from_state(state)
    print(json.dumps(data, indent=2))
except Exception as e:
    print('Failed to load JSON:', e)
