from DrissionPage import ChromiumPage, ChromiumOptions
import time
import json

url = 'https://housing.com/buy-panchamrut-orchid-by-panchamrut-ventures-in-thaltej-ahmedabad-pid-353368'
co = ChromiumOptions()
co.headless(True)
page = ChromiumPage(co)

# Listen to all XHR/Fetch requests
page.listen.start()

try:
    page.get(url)
    time.sleep(5)
    
    found = False
    for packet in page.listen.steps():
        if packet.response and packet.response.body:
            try:
                # Some bodies might be dicts, some strings
                body = packet.response.body
                body_str = json.dumps(body) if isinstance(body, dict) else str(body)
                if 'areaConfig' in body_str:
                    print('FOUND areaConfig in API response!')
                    print('URL:', packet.url)
                    found = True
                    break
            except:
                pass
    if not found:
        print('Did not find areaConfig in any intercepted packet')
except Exception as e:
    print('Error:', e)
finally:
    page.quit()
