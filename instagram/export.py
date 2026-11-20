import json
import pandas as pd

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['instagram_db']
user_coll = db['instagram_user_data']
all_data = list(user_coll.find())
df = pd.DataFrame(all_data)
df.to_excel("instagram_restaurants.xlsx", index=False, engine="openpyxl")
print("Excel file exported successfully!")