from parsel import Selector
html = open('pid_360980_area.html', encoding='utf-8').read()
sel = Selector(html)
print("4.", sel.xpath("//*[contains(text(),'Last updated')]//text()").getall())
