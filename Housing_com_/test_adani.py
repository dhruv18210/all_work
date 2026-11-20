from DrissionPage import ChromiumPage, ChromiumOptions
import json

def fetch_json(url):
    co = ChromiumOptions()
    co.headless(True)
    page = ChromiumPage(co)
    page.get(url)
    
    js_state = page.run_js('return window.__INITIAL_STATE__')
    
    def find_key(obj, key):
        if isinstance(obj, dict):
            if key in obj: return obj[key]
            for v in obj.values():
                res = find_key(v, key)
                if res is not None: return res
        elif isinstance(obj, list):
            for item in obj:
                res = find_key(item, key)
                if res is not None: return res
        return None

    area_config = find_key(js_state, 'areaConfig')
    print("areaConfig found:", json.dumps(area_config, indent=2))
    page.quit()

if __name__ == '__main__':
    fetch_json('https://housing.com/buy-adani-augusta-by-adani-realty-in-chharodi-ahmedabad-pid-353368')
