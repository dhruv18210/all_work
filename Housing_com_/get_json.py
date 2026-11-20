import json
from parsel import Selector

html = open('pid_360980_area.html', encoding='utf-8').read()
sel = Selector(html)
scripts = sel.xpath("//script[@type='application/ld+json']/text()").getall()
data = None
for s in scripts:
    parsed = json.loads(s)
    if isinstance(parsed, list):
        for item in parsed:
            if item.get('@type') in ['RealEstateListing', 'Product', 'Place', 'ApartmentComplex', 'House', 'SingleFamilyResidence', 'Residence', 'Product']:
                data = item
                break
            if 'product' in str(item).lower() or 'address' in str(item).lower():
                data = item
    elif isinstance(parsed, dict):
        if parsed.get('@type') in ['RealEstateListing', 'Product', 'Place', 'ApartmentComplex', 'House', 'SingleFamilyResidence', 'Residence', 'Product']:
            data = parsed
            break
        if 'product' in str(parsed).lower() or 'address' in str(parsed).lower():
            data = parsed

if data:
    with open('project_json.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    print("Saved")
else:
    print("Not found")
