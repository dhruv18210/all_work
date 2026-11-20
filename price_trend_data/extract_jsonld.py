import json
import re

for filename in ['amara_shilaj.html', 'happy_shela.html', 'swagat_satelight.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    scripts = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', content, re.DOTALL)
    print(f'--- {filename} ---')
    for s in scripts:
        try:
            data = json.loads(s)
            print(json.dumps(data, indent=2))
        except Exception as e:
            print('Error decoding JSON:', str(e))
