from pymongo import MongoClient
from openpyxl import Workbook
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["jhonson_com"]
detail_collection = db["johnson_product_details"]

wb = Workbook()
ws = wb.active
documents = list(detail_collection.find({}, {"_id": 0}))
if documents:
    headers = list(documents[0].keys())
    ws.append(headers)
    for doc in documents:
        row = []
        for h in headers:
            value = doc.get(h, "")
            # Convert list/dict to string
            if isinstance(value, (list, dict)):
                value = json.dumps(value, ensure_ascii=False)
            row.append(value)
        ws.append(row)
wb.save("johnson_product_details.xlsx")
print("Done")
