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
    
    match1 = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\})\s*;</script>', html, re.DOTALL)
    if match1:
        print("Found window.__INITIAL_STATE__")
        print(match1.group(1)[:200])
    
    match2 = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.DOTALL)
    if match2:
        print("Found __NEXT_DATA__")
        print(match2.group(1)[:200])
        
    match3 = re.search(r'organicOrDirectTraffic', html)
    if match3:
        print("Found organicOrDirectTraffic string in HTML")
        
        # Print the surrounding 500 chars
        idx = match3.start()
        print(html[max(0, idx-100):min(len(html), idx+100)])
        
except Exception as e:
    print('Error:', e)
finally:
    page.quit()
