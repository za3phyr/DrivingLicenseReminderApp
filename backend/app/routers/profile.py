from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.firebase import db
from typing import Optional

router = APIRouter()

# ─── Models ───
class PersonalDetails(BaseModel):
    name: str
    surname: str
    dob: str

class VehicleDetails(BaseModel):
    model: str
    plate: str
    series: str

class LicenseDetails(BaseModel):
    licenseType: str
    issueDate: str
    expiryDate: str
    issuingState: str
    isInternational: bool

class PreferencesDetails(BaseModel):
    emailNotif: bool
    pushNotif: bool
    darkMode: bool
    language: str

# ─── Get Profile ───
@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        doc = db.collection("users").document(user_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        return doc.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Personal Details ───
@router.put("/{user_id}/personal")
async def update_personal(user_id: str, data: PersonalDetails):
    try:
        db.collection("users").document(user_id).update({
            "name": data.name,
            "surname": data.surname,
            "dob": data.dob,
        })
        return {"message": "Personal details updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Vehicle Details ───
@router.put("/{user_id}/vehicle")
async def update_vehicle(user_id: str, data: VehicleDetails):
    try:
        db.collection("users").document(user_id).update({
            "vehicle": {
                "model": data.model,
                "plate": data.plate,
                "series": data.series,
            }
        })
        return {"message": "Vehicle details updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update License Details ───
@router.put("/{user_id}/license")
async def update_license(user_id: str, data: LicenseDetails):
    try:
        db.collection("users").document(user_id).update({
            "license": {
                "licenseType": data.licenseType,
                "issueDate": data.issueDate,
                "expiryDate": data.expiryDate,
                "issuingState": data.issuingState,
                "isInternational": data.isInternational,
            }
        })
        return {"message": "License details updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Preferences ───
@router.put("/{user_id}/preferences")
async def update_preferences(user_id: str, data: PreferencesDetails):
    try:
        db.collection("users").document(user_id).update({
            "preferences": {
                "emailNotif": data.emailNotif,
                "pushNotif": data.pushNotif,
                "darkMode": data.darkMode,
                "language": data.language,
            },
            "profileComplete": True
        })
        return {"message": "Preferences updated and profile completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))