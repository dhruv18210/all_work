from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pymongo.errors import PyMongoError
import os

app = FastAPI(title="MongoDB Backend API")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["Housing_com"]


def serialize_document(document):
    """Convert MongoDB ObjectId into a JSON-compatible string."""
    document["_id"] = str(document["_id"])
    return document


@app.get("/")
def home():
    return {"message": "FastAPI backend is running"}


@app.get("/health")
def health():
    try:
        client.admin.command("ping")
        return {"status": "connected", "database": db.name}
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="MongoDB connection failed") from exc


@app.get("/collections")
def get_collections():
    try:
        return {"collections": db.list_collection_names()}
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not retrieve collections") from exc


@app.get("/data/{collection_name}")
def get_data(collection_name: str, limit: int = 100):
    if limit < 1 or limit > 2600:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")
    try:
        if collection_name not in db.list_collection_names():
            raise HTTPException(status_code=404, detail="Collection not found")
        documents = list(db[collection_name].find().limit(limit))
        return {
            "count": len(documents),
            "data": [
                serialize_document(doc) for doc in documents
            ]
        }

    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Failed to fetch MongoDB data") from exc
