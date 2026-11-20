from playwright.sync_api import sync_playwright
import time


def amazon_automation():
    with sync_playwright() as p:

        # Launch Browser
        browser = p.chromium.launch(
            headless=False,
        )

        # Create Browser Context
        context = browser.new_context()

        # Create New Page
        page = context.new_page()

        # Open Amazon
        page.goto("https://www.amazon.in")

        # Maximize Window
        page.set_viewport_size({"width": 1536, "height": 864})

        # Wait for page load
        time.sleep(3)

        print("=" * 50)
        print("Amazon Home Page Opened")
        print("=" * 50)

        # Search Product
        search_box = page.locator("#twotabsearchtextbox")

        search_box.fill("Laptop")

        search_box.press("Enter")

        time.sleep(3)

        print("Laptop Search Completed")

        print()

        # Count Products
        products = page.locator(
            "div[data-component-type='s-search-result']"
        )

        total_products = products.count()

        print(f"Products Found : {total_products}")

        print()
        print("=" * 50)
        print("First Five Products")
        print("=" * 50)

        titles = page.locator(
            "div[data-component-type='s-search-result'] h2"
        )

        count = min(5, titles.count())

        for i in range(count):
            print(f"{i + 1}. {titles.nth(i).text_content()}")

        print()

        # Open First Product
        with page.expect_popup() as popup:
            titles.first.click()

        product_page = popup.value

        product_page.wait_for_load_state("networkidle")

        print("=" * 50)
        print("Product Page Opened")
        print("=" * 50)

        # Product Title
        product_title = product_page.locator("#productTitle").text_content()

        print("Title :")
        print(product_title)

        print()

        # Product Price
        try:
            price = product_page.locator(".a-price-whole").first.text_content()
            print("Price :", price)

        except:
            print("Price Not Found")

        print()

        # Take Screenshot
        product_page.screenshot(path="amazon_product.png")

        print("Screenshot Saved")

        print()

        # Scroll Down
        product_page.mouse.wheel(0, 3000)

        print("Scrolled Down")

        print()

        # Add to Cart
        try:

            product_page.locator("#add-to-cart-button").click()

            print("Added to Cart Successfully")

        except:

            print("Add To Cart Button Not Available")

        print()

        # Go to Cart
        try:

            product_page.goto("https://www.amazon.in/gp/cart/view.html")

            product_page.wait_for_load_state("networkidle")

            print("Cart Opened")

        except:

            print("Unable to Open Cart")

        print()

        print("=" * 50)
        print("Automation Completed Successfully")
        print("=" * 50)

        browser.close()


amazon_automation()
