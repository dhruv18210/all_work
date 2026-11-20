import requests
from parsel import Selector
from urllib.parse import urljoin

for i in range(0, 50):

    cookies = {
        'NID': 'Cu4BCAESoAEBOxGDSM8u65q53YYKVY9YvuOXNeGZAMdVz95vuOkyQxle2e7gcEaqGg69_i5GNQgOgDDm_1Gkqg_PO-MYpmQK2y8Uf0Sowb2WCF36OHcLZ79fPiiXACgpsA9Y0p9HtVewajBCkgIrsbC6jUY7WUCtzLDFGUdonJNNhZASZmx91eZ4iCIOTS9-H5Fg2yXQ9MPaKu0dZ_NDD5LTbyOr-NztKAEyRQHSrAfPWwSZSCA-6sbGFkIHcmqqWAlxXuNu1d00ziLyOjvfj0G2zIdd29JgmHHX00Dm_I6Qe-0FIK881jCX73UMysoJBw',
    }

    headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    }

    params = {
        'q': 'Savitar Realty AHmedabad',
    }

    response = requests.get('https://www.google.com/search', params=params, cookies=cookies, headers=headers)
    print(response.status_code)
    check_urls = Selector(text=response.text)
    urls = check_urls.xpath('//span[@class="V9tjod"]/a/@href').getall()
    if urls:
        print("Response ok = ", urls[0])
        with open("demo.html", "wb") as f:
            f.write(response.content)
    else:
        print("Response not ok")

    href = urls[0]

    google_url = urljoin("https://www.google.com/", href)

    session = requests.Session()

    response = session.get(
        google_url,
        allow_redirects=True,
        timeout=20,
    )

    print("Final URL:", response.url)