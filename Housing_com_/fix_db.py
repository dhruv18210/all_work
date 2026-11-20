from pymongo import MongoClient

client = MongoClient("mongodb+srv://dhaval2105:qZ8147d34r1p9XGv@cluster0.zoxmb84.mongodb.net/?retryWrites=true&w=majority")
db = client["Housing_com"]
detail_collection = db["test_property_detail"]

docs = detail_collection.find({})
updated_count = 0
for doc in docs:
    bhk_type = doc.get('bhk_type', '')
    project_name = doc.get('project_name', '')
    
    # Skip if it's a dead link row
    if not bhk_type and not project_name:
        continue
        
    type_string = (str(bhk_type) + " " + str(project_name)).lower()
    
    if 'villa' in type_string:
        new_type = 'Villa'
    elif 'plot' in type_string or 'land' in type_string:
        new_type = 'Plot'
    elif 'independent house' in type_string or 'house' in type_string:
        new_type = 'Independent House'
    elif 'penthouse' in type_string:
        new_type = 'Penthouse'
    elif 'apartment' in type_string or 'flat' in type_string:
        new_type = 'Apartment'
    else:
        new_type = 'Apartment' # Safest default
        
    if doc.get('property_type') != new_type:
        detail_collection.update_one({'_id': doc['_id']}, {'$set': {'property_type': new_type}})
        updated_count += 1

print(f"Successfully updated {updated_count} property_type records in MongoDB!")
