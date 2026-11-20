from parsel import Selector
import re

def test(html_file):
    html = open(html_file, encoding='utf-8').read()
    sel = Selector(html)
    b = sel.xpath("//div[contains(text(), 'Built') and contains(text(), 'Area')]/following-sibling::div/text() | //div[contains(text(), 'Built') and contains(text(), 'Area')]/preceding-sibling::div/text()").get(default='')
    c = sel.xpath("//div[contains(text(), 'Carpet Area')]/following-sibling::div/text() | //div[contains(text(), 'Carpet Area')]/preceding-sibling::div/text()").get(default='')
    bhk = sel.xpath("//div[starts-with(text(), 'Configuration')]/following-sibling::div/text() | //div[starts-with(text(), 'Configuration')]/preceding-sibling::div/text()").get(default='')
    print(html_file, 'BUILT:', b, 'CARPET:', c, 'BHK:', bhk)

test('pid_360980_area.html')
test('pid_329319_bhk.html')
