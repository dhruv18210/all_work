import pandas as pd
from scrapling.fetchers import Fetcher
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_cera_products():
    url = 'https://www.cera-india.com/'
    logger.info(f"Fetching {url}")
    
    # We use basic Fetcher to avoid the browserforge issue on Windows
    page = Fetcher.get(url)
    
    products = []
    
    # Let's find all links that might point to products or categories
    # In a real scenario, you'd navigate through categories -> product listings -> product details
    # Here we demonstrate extracting links and hypothetically finding products
    links = page.css('a::attr(href)').getall()
    
    category_links = [link for link in links if link and 'products' in link.lower()]
    category_links = list(set(category_links))
    
    logger.info(f"Found {len(category_links)} potential category/product links on home page.")
    
    # For demonstration, we'll visit the first category link (if any)
    if category_links:
        test_cat_url = category_links[0]
        if not test_cat_url.startswith('http'):
            test_cat_url = f"https://www.cera-india.com{test_cat_url}"
            
        logger.info(f"Fetching category page: {test_cat_url}")
        cat_page = Fetcher.get(test_cat_url)
        
        # Hypothetical extraction of product elements
        # You'll need to update the CSS selectors based on the actual DOM
        product_elements = cat_page.css('.product-item, .views-row') 
        
        for el in product_elements:
            title = el.css('h2, .title, h3').css('::text').get(default='Unknown')
            link = el.css('a::attr(href)').get(default='')
            image = el.css('img::attr(src)').get(default='')
            
            if title != 'Unknown':
                products.append({
                    'Title': title.strip(),
                    'Link': f"https://www.cera-india.com{link}" if link.startswith('/') else link,
                    'Image': image
                })
    
    if not products:
        logger.warning("No products found with generic selectors. You may need to inspect the HTML and update the CSS selectors in this script.")
        # Add some dummy data just to show the excel export works
        products.append({
            'Title': 'Sample Cera Wash Basin',
            'Link': 'https://www.cera-india.com/wash-basins/sample',
            'Image': 'https://www.cera-india.com/sample.jpg'
        })
        
    logger.info(f"Extracted {len(products)} products. Saving to Excel...")
    
    df = pd.DataFrame(products)
    output_file = 'cera_products.xlsx'
    df.to_excel(output_file, index=False)
    logger.info(f"Data saved to {output_file} successfully!")

if __name__ == '__main__':
    scrape_cera_products()
