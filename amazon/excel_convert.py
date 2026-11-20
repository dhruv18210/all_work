from pymongo import MongoClient
from openpyxl import Workbook
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["amazon"]
collection = db["mobdetails"]

wb = Workbook()
ws = wb.active
ws.title = "Amazon Products"

documents = list(collection.find({}, {"_id": 0}))
if not documents:
    print("No data found.")
    exit()
headers = list(documents[0].keys())
ws.append(headers)

for doc in documents:
    row = []
    for key in headers:
        value = doc.get(key, "")
        if isinstance(value, list):
            value = " || ".join(str(v) for v in value)
        elif isinstance(value, dict):
            value = json.dumps(value, ensure_ascii=False)
        row.append(value)
    ws.append(row)

wb.save("amazon_mobile_details.xlsx")
print("Excel Saved Successfully")
