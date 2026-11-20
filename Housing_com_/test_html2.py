import sys
sys.stdout.reconfigure(encoding='utf-8')
from DrissionPage import ChromiumPage, ChromiumOptions
import re
import time
url = 'https://housing.com/buy-panchamrut-orchid-by-panchamrut-ventures-in-thaltej-ahmedabad-pid-353368'
co = ChromiumOptions()
co.headless(True)
page = ChromiumPage(co)
try:
    page.get(url)
    time.sleep(3)
    html = page.html
    # Try to find Carpet Area
    match = re.search(r'Carpet Area', html, re.IGNORECASE)
    if match:
        print("Found Carpet Area in HTML!")
        idx = match.start()
        print(html[max(0, idx-200):min(len(html), idx+200)])
    else:
        print("Carpet Area not found in HTML")
except Exception as e:
    print('Error:', e)
finally:
    page.quit()
