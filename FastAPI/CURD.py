
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(
    title="Property Management API",
    description="Learning CRUD Operations",
    version="1.0"
)

# Temporary storage
properties = []


# Request model for creating a property
class PropertyCreate(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    city: str
    price: float = Field(gt=0)
    bedrooms: int = Field(ge=1, le=10)


# Request model for updating all property details
class PropertyUpdate(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    city: str
    price: float = Field(gt=0)
    bedrooms: int = Field(ge=1, le=10)


# Request model for updating selected fields
class PropertyPartialUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=50)
    city: str | None = None
    price: float | None = Field(default=None, gt=0)
    bedrooms: int | None = Field(default=None, ge=1, le=10)


# 1. CREATE PROPERTY
@app.post("/properties", status_code=201)
def create_property(property: PropertyCreate):

    new_id = max(
        (item["id"] for item in properties),
        default=0
    ) + 1

    property_data = property.model_dump()

    property_data["id"] = new_id

    properties.append(property_data)

    return {
        "message": "Property created successfully",
        "data": property_data
    }


# 2. READ ALL PROPERTIES
@app.get("/properties")
def get_all_properties():

    return {
        "total": len(properties),
        "data": properties
    }


# 3. READ ONE PROPERTY
@app.get("/properties/{property_id}")
def get_property(property_id: int):

    for property in properties:

        if property["id"] == property_id:
            return property

    raise HTTPException(
        status_code=404,
        detail="Property not found"
    )


# 4. UPDATE FULL PROPERTY - PUT
@app.put("/properties/{property_id}")
def update_property(
    property_id: int,
    updated_property: PropertyUpdate
):

    for index, property in enumerate(properties):

        if property["id"] == property_id:

            property_data = updated_property.model_dump()

            property_data["id"] = property_id

            properties[index] = property_data

            return {
                "message": "Property updated successfully",
                "data": property_data
            }

    raise HTTPException(
        status_code=404,
        detail="Property not found"
    )


# 5. UPDATE SELECTED FIELDS - PATCH
@app.patch("/properties/{property_id}")
def partial_update_property(
    property_id: int,
    updated_data: PropertyPartialUpdate
):

    for property in properties:

        if property["id"] == property_id:

            update_fields = updated_data.model_dump(
                exclude_unset=True
            )

            property.update(update_fields)

            return {
                "message": "Property partially updated",
                "data": property
            }

    raise HTTPException(
        status_code=404,
        detail="Property not found"
    )


# 6. DELETE PROPERTY
@app.delete("/properties/{property_id}")
def delete_property(property_id: int):

    for index, property in enumerate(properties):

        if property["id"] == property_id:

            deleted_property = properties.pop(index)

            return {
                "message": "Property deleted successfully",
                "data": deleted_property
            }

    raise HTTPException(
        status_code=404,
        detail="Property not found"
    )


# HOME
@app.get("/")
def home():

    return {
        "message": "Welcome to Property Management API"
    }
