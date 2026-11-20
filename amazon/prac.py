import requests

url = "https://www.amazon.in/iPhone-Pro-Max-512-Promotion/dp/B0FQFHZ2C3/ref=sr_1_1_sspa?crid=2RCHZM2YGLOE0&dib=eyJ2IjoiMSJ9.JvlsnsC8j_qjafU1IkeGx_xY7h88O-5jU0i-c0aiacwD9DvDEZSEzEMHQmqD7sswSxFGahKKLRAgMc5eZBLmfT5VDQum4gXUp6h22x1IU0XBEsqkaTEJ1J85XPigttzaZEb8jg3TI_LS3xgYth1FP8gLbuNEkO0Qx6XR2KZxxAavgocLeEZvyAiNqpZeya64DIa-ap3hm9ZBn1LbsHX8bLgLA-Q3-gAoZEgL3N6UjMw.bnSisA81bw3pXrx6RqraUHNv-7AMijrmy89eJ6aNero&dib_tag=se&keywords=mobile&qid=1786008649&sprefix=mobile%2Caps%2C245&sr=8-1-spons&aref=hOG5sjXbLW&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1"
header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    "Accept-Language": "en-IN,en;q=0.9"
}
response = requests.get(url, headers=header, timeout=30)
if "validateCaptcha" in response.text or "Continue shopping" in response.text:
    print("Blocked by Amazon")

with open("prac11.html", "w", encoding="utf-8") as f:
    f.write(response.text)




