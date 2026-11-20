from DrissionPage import ChromiumPage, ChromiumOptions
import time

url = 'https://housing.com/buy-janaadhar-sanand-by-janaadhar-western-projects-llp-in-sanand-ahmedabad-pid-291890'
co = ChromiumOptions()
co.headless(True)
page = ChromiumPage(co)
print("Navigating...")
page.get(url)
time.sleep(3)
print("Saving screenshot...")
page.get_screenshot(path='screenshot.png')
print("Checking JS state...")
state = page.run_js('return window.__INITIAL_STATE__')
if state:
    print("State found! Keys:", list(state.keys())[:5])
else:
    print("State is None")
page.quit()
