from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from app.services.firebase import db
from typing import Optional
import re
from datetime import datetime

router = APIRouter()

# ─── Models ───
class PersonalDetails(BaseModel):
    name: str
    surname: str
    dob: str

    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if not v.replace(' ', '').isalpha():
            raise ValueError('Name must contain only letters')
        return v

    @validator('surname')
    def validate_surname(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Surname must be at least 2 characters long')
        if not v.replace(' ', '').isalpha():
            raise ValueError('Surname must contain only letters')
        return v

    @validator('dob')
    def validate_dob(cls, v):
        pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(pattern, v):
            raise ValueError('Date of birth must be in DD/MM/YYYY format')
        try:
            dob = datetime.strptime(v, "%d/%m/%Y")
            today = datetime.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 18:
                raise ValueError('You must be at least 18 years old')
            if age > 120:
                raise ValueError('Please enter a valid date of birth')
        except ValueError as e:
            raise e
        return v

class VehicleDetails(BaseModel):
    model: str
    plate: str
    series: str

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

class LicenseDetails(BaseModel):
    licenseType: str
    issueDate: str
    expiryDate: str
    issuingState: str
    isInternational: bool

    @validator('licenseType')
    def validate_license_type(cls, v):
        valid_types = ['A', 'A1', 'A2', 'B', 'B1', 'C', 'C1', 'D', 'D1', 'E']
        if v.upper() not in valid_types:
            raise ValueError(f'License type must be one of: {", ".join(valid_types)}')
        return v.upper()

    @validator('issueDate')
    def validate_issue_date(cls, v):
        pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(pattern, v):
            raise ValueError('Issue date must be in DD/MM/YYYY format')
        try:
            issue_date = datetime.strptime(v, "%d/%m/%Y")
            if issue_date > datetime.today():
                raise ValueError('Issue date cannot be in the future')
        except ValueError as e:
            raise e
        return v

    @validator('expiryDate')
    def validate_expiry_date(cls, v):
        pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(pattern, v):
            raise ValueError('Expiry date must be in DD/MM/YYYY format')
        return v

    @validator('issuingState')
    def validate_issuing_state(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Issuing state must be at least 2 characters long')
        return v

class PreferencesDetails(BaseModel):
    emailNotif: bool
    pushNotif: bool
    darkMode: bool
    language: str

    @validator('language')
    def validate_language(cls, v):
        valid_languages = ['English', 'Turkish', 'Greek', 'Arabic', 'French']
        if v not in valid_languages:
            raise ValueError(f'Language must be one of: {", ".join(valid_languages)}')
        return v

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
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
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
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
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
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
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
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))