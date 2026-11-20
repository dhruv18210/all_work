from playwright.sync_api import sync_playwright
import json

def get_menu_links():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto('https://www.cera-india.com/', wait_until='networkidle')
        
        links_data = []
        # Find the mega menu links
        # Usually inside a nav or header
        links = page.locator('header a, .mega-menu a, .region-header a').all()
        for link in links:
            href = link.get_attribute('href')
            text = link.inner_text().strip()
            if href and len(text) > 0 and ('/cera/' in href or '/tiles/' in href or '/sanitaryware' in href or '/faucets' in href):
                links_data.append({'text': text, 'href': href})
        
        # Deduplicate
        seen = set()
        uniq = []
        for d in links_data:
            if d['href'] not in seen:
                seen.add(d['href'])
                uniq.append(d)
                
        print(f"Found {len(uniq)} category links:")
        for u in uniq:
            print(f"- {u['text']} : {u['href']}")
            
        browser.close()

if __name__ == "__main__":
    get_menu_links()
