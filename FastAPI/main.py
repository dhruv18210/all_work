from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Property Management API",
    description="My first FastAPI learning project",
    version="1.0"
)


# Request body structure
class Property(BaseModel):
    name: str
    city: str
    price: float
    description: str | None = None   # OPTIONAL OR DEFAULT NULL FIELD BY USING None = None


# class PropertyModel(BaseModel):
#     name: str = Field(min_length=3, max_length=50)      # Field() allows you to define rules before data enters your application, reducing invalid data and unexpected errors.
#     city: str = Field(min_length=2)
#     price: float = Field(gt=0)
#     bedrooms: int = Field(ge=1, le=10)
#     kitchen: int = 1                      # for default value when a user doesn't provide a field.
#     available: bool = True                # for default value when a user doesn't provide a field.


# 1. Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to Property Management API"
    }


# 2. About endpoint
@app.get("/about")
def about():
    return {
        "application": "Property Management",
        "technology": "FastAPI"
    }


# 3. Get property using ID
@app.get("/properties/{property_id}")
def get_property(property_id: int):
    return {
        "property_id": property_id
    }


# 4. Search property using city
@app.get("/search")
def search_property(city: str):
    return {
        "city": city,
        "message": "Search successful"
    }


# 5. Create property
@app.post("/properties")
def create_property(property: Property):
    return {
        "message": "Property created successfully",
        "data": property.model_dump()
    }
