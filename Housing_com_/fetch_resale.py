from DrissionPage import ChromiumPage, ChromiumOptions
import time

co = ChromiumOptions()
co.headless(False)
page = ChromiumPage(co)

page.get('https://housing.com/in/buy/ahmedabad/satellite-gid')
time.sleep(5)

# Find first property link
link = page.ele('tag:a@@href:buy-')
if link:
    url = link.link
    print('URL:', url)
    page.get(url)
    time.sleep(5)
    with open('test_property.html', 'w', encoding='utf-8') as f:
        f.write(page.html)
else:
    print('No link found')

page.quit()
