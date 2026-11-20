from scrapling.fetchers import StealthyFetcher

print("Starting fetch...")
# Fetching the page
p = StealthyFetcher.fetch('https://example.com', headless=True, network_idle=True)

print("Page fetched successfully!")
# Finding elements
title = p.css('h1::text').get()
print(f"Title found: {title}")
