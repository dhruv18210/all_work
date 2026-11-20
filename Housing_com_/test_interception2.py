from DrissionPage import ChromiumPage, ChromiumOptions
import time
import json

url = 'https://housing.com/buy-panchamrut-orchid-by-panchamrut-ventures-in-thaltej-ahmedabad-pid-353368'
co = ChromiumOptions()
co.headless(False) # use False to avoid bot protection
page = ChromiumPage(co)

# Listen to everything
page.listen.start('housing.com')

try:
    page.get(url)
    print("Waiting for packets...")
    time.sleep(10)
    
    found = False
    for packet in page.listen.steps():
        if packet.response and packet.response.body:
            try:
                body = packet.response.body
                body_str = json.dumps(body) if isinstance(body, dict) else str(body)
                if 'areaConfig' in body_str and 'organicOrDirectTraffic' in body_str:
                    print('!!! FOUND THE EXACT JSON !!!')
                    print('URL:', packet.url)
                    found = True
                    break
            except Exception as e:
                pass
    if not found:
        print('Could not find the JSON in intercepted packets.')
except Exception as e:
    print('Error:', e)
finally:
    page.quit()
