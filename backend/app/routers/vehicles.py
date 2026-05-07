from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from app.services.firebase import db
from firebase_admin import firestore
import re
from datetime import datetime

router = APIRouter()

# ─── Models ───
class VehicleModel(BaseModel):
    model: str
    plate: str
    series: str
    insuranceProvider: str
    insuranceExpiry: str
    roadTaxExpiry: str

    @validator('model')
    def validate_model(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Vehicle model must be at least 2 characters long')
        return v

    @validator('plate')
    def validate_plate(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Plate number must be at least 2 characters long')
        if len(v.strip()) > 10:
            raise ValueError('Plate number must be at most 10 characters long')
        return v.upper()

    @validator('series')
    def validate_series(cls, v):
        if len(v.strip()) < 5:
            raise ValueError('Series/Chassis number must be at least 5 characters long')
        return v.upper()

    @validator('insuranceProvider')
    def validate_insurance_provider(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Insurance provider must be at least 2 characters long')
        return v

    @validator('insuranceExpiry')
    def validate_insurance_expiry(cls, v):
        pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(pattern, v):
            raise ValueError('Insurance expiry must be in DD/MM/YYYY format')
        try:
            expiry = datetime.strptime(v, "%d/%m/%Y")
            if expiry < datetime.today():
                raise ValueError('Insurance has already expired')
        except ValueError as e:
            raise e
        return v

    @validator('roadTaxExpiry')
    def validate_road_tax_expiry(cls, v):
        pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(pattern, v):
            raise ValueError('Road tax expiry must be in DD/MM/YYYY format')
        try:
            expiry = datetime.strptime(v, "%d/%m/%Y")
            if expiry < datetime.today():
                raise ValueError('Road tax has already expired')
        except ValueError as e:
            raise e
        return v

# ─── Get All Vehicles ───
@router.get("/{user_id}")
async def get_vehicles(user_id: str):
    try:
        vehicles = db.collection("users").document(user_id).collection("vehicles").stream()
        result = []
        for vehicle in vehicles:
            v = vehicle.to_dict()
            v["id"] = vehicle.id
            result.append(v)
        return {"vehicles": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Add Vehicle ───
@router.post("/{user_id}")
async def add_vehicle(user_id: str, data: VehicleModel):
    try:
        vehicle_ref = db.collection("users").document(user_id).collection("vehicles").document()
        vehicle_ref.set({
            "model": data.model,
            "plate": data.plate,
            "series": data.series,
            "insuranceProvider": data.insuranceProvider,
            "insuranceExpiry": data.insuranceExpiry,
            "roadTaxExpiry": data.roadTaxExpiry,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        return {
            "message": "Vehicle added successfully",
            "vehicleId": vehicle_ref.id
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Vehicle ───
@router.put("/{user_id}/{vehicle_id}")
async def update_vehicle(user_id: str, vehicle_id: str, data: VehicleModel):
    try:
        db.collection("users").document(user_id).collection("vehicles").document(vehicle_id).update({
            "model": data.model,
            "plate": data.plate,
            "series": data.series,
            "insuranceProvider": data.insuranceProvider,
            "insuranceExpiry": data.insuranceExpiry,
            "roadTaxExpiry": data.roadTaxExpiry,
        })
        return {"message": "Vehicle updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Delete Vehicle ───
@router.delete("/{user_id}/{vehicle_id}")
async def delete_vehicle(user_id: str, vehicle_id: str):
    try:
        db.collection("users").document(user_id).collection("vehicles").document(vehicle_id).delete()
        return {"message": "Vehicle deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))