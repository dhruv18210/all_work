import re
import json
from DrissionPage import ChromiumPage, ChromiumOptions

url = 'https://housing.com/buy-kalasagar-skyline-by-v3-construction-in-shahibaug-ahmedabad-pid-319600'

print(f"Fetching data from: {url}")
co = ChromiumOptions()
co.headless(True)  # Run browser in background
page = ChromiumPage(co)
page.get(url)
html = page.html
page.quit()

# Try to find __NEXT_DATA__ first
m = re.search(r'id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
if not m:
    # Housing.com now often uses window.__INITIAL_STATE__ instead, so we fallback to that if NEXT_DATA is gone
    m = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});', html, re.S)

if m:
    raw_data = m.group(1)
    try:
        # Decode: Convert raw JSON string into a Python dictionary
        parsed_data = json.loads(raw_data)
        
        # Encode: Convert Python dictionary back into a nicely formatted JSON string
        formatted_json = json.dumps(parsed_data, indent=4, ensure_ascii=False)
        
        with open('next_data.json', 'w', encoding='utf-8') as f:
            f.write(formatted_json)
        print("Successfully decoded and saved as formatted JSON!")
    except json.JSONDecodeError as e:
        print("Found data, but failed to decode JSON:", e)
        # Fallback to saving raw data if decoding fails
        with open('next_data.json', 'w', encoding='utf-8') as f:
            f.write(raw_data)
        print("Saved raw string instead.")
else:
    print("Could not find __NEXT_DATA__ or __INITIAL_STATE__ in the page source.")
