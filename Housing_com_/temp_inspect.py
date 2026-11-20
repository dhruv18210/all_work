import re
text = open('json_parse.txt', encoding='utf-8', errors='ignore').read()
m = re.search(r'"propertyType"\s*:\s*"(.*?)"', text)
if m: print("propertyType found:", m.group(1))
m2 = re.search(r'"propertyType"\s*:\s*\["(.*?)"\]', text)
if m2: print("propertyType array found:", m2.group(1))

import json
try:
    data = json.load(open('bhk.json', encoding='utf-8'))
    print('bhk.json propertyType:', data.get('propertyDetails', {}).get('details', {}).get('propertyType'))
except: pass
