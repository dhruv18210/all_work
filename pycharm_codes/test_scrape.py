import requests
from parsel import Selector

session = requests.session()

headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'origin': 'https://broker.kaizenproperty.org',
    'referer': 'https://broker.kaizenproperty.org/',
    'content-type': 'application/x-www-form-urlencoded',
}

data = {
    'cellno': '9974469888',
    'password': 'sr@4698',
    'submitted': '1',
}

response = session.post('https://broker.kaizenproperty.org/index.php/user/authenticate.html', headers=headers, data=data)
print('Login URL:', response.url)
print('Login Status:', response.status_code)

response1 = session.post('https://broker.kaizenproperty.org/properties/listing/all.html', headers=headers, data={'per_page': '0', 'searchfield': '', 'searchval': '', 'searchbybroker': '', 'sortfield': 'date', 'sorttype': 'DESC'})
print('List URL:', response1.url)
print('List Status:', response1.status_code)

tree = Selector(response1.text)
rows = tree.xpath('//table[@id="list"]/tbody/tr')
print('Rows found:', len(rows))
if len(rows) == 0:
    print(response1.text[:500])
