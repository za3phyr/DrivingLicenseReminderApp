from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.firebase import db
from firebase_admin import firestore

router = APIRouter()

# ─── Models ───
class VehicleModel(BaseModel):
    model: str
    plate: str
    series: str
    insuranceProvider: str
    insuranceExpiry: str
    roadTaxExpiry: str

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