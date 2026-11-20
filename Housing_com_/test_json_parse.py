import json
import re

def extract_from_text(filename):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    data = {}
    
    # 1. Carpet Area & Builtup Area
    area_configs = re.findall(r'"areaConfig"\s*:\s*\[(.*?)\]', text, re.DOTALL)
    if area_configs:
        config_str = area_configs[0]
        carpet_match = re.search(r'"name"\s*:\s*"Carpet Area".*?"value"\s*:\s*([\d\.]+)', config_str, re.DOTALL)
        if carpet_match:
            data['carpet_area'] = carpet_match.group(1)
            
        builtup_match = re.search(r'"name"\s*:\s*"(?:Super )?Builtup Area".*?"value"\s*:\s*([\d\.]+)', config_str, re.DOTALL)
        if builtup_match:
            data['builtup_area'] = builtup_match.group(1)

    # 2. Project Name
    project_match = re.search(r'"projectAttributes"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"', text, re.DOTALL)
    if project_match:
        data['project_name'] = project_match.group(1)
        
    # 3. Locality, City
    locality_match = re.search(r'"fullLocalityName"\s*:\s*"([^"]+)"', text)
    if locality_match:
        data['full_locality'] = locality_match.group(1)
        
    # 4. Price
    price_match = re.search(r'"price"\s*:\s*\{[^}]*"displayValue"\s*:\s*"([^"]+)"', text, re.DOTALL)
    if price_match:
        data['parsed_price'] = price_match.group(1)
        
    # 5. Average Price
    avg_price = re.search(r'"averagePrice"\s*:\s*"([^"]+)"', text)
    if avg_price:
        data['price_per_sqft'] = avg_price.group(1)
        
    # 6. Rera ID
    rera = re.search(r'"modifiedReraId"\s*:\s*"([^"]+)"', text)
    if rera:
        data['rera_id'] = rera.group(1)
        
    print(json.dumps(data, indent=2))

extract_from_text('json_parse.txt')
