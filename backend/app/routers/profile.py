from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator
from app.services.firebase import db
from app.services.jwt import verify_token
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
async def get_profile(user_id: str, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        doc = db.collection("users").document(user_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        data = doc.to_dict()

        # Fetch all vehicles from subcollection
        vehicles_ref = db.collection("users").document(user_id).collection("vehicles").stream()
        vehicles = []
        for vehicle in vehicles_ref:
            v = vehicle.to_dict()
            vehicles.append({
                "id": vehicle.id,
                "model": v.get("model"),
                "plate": v.get("plate"),
                "series": v.get("series"),
            })

        # Build response
        response = {
            "name": data.get("name"),
            "surname": data.get("surname"),
            "dob": data.get("dob"),
            "email": data.get("email"),
            "profileComplete": data.get("profileComplete"),
            "createdAt": data.get("createdAt"),
        }

        if vehicles:
            response["vehicles"] = vehicles
        if data.get("license"):
            response["license"] = data.get("license")
        if data.get("preferences"):
            response["preferences"] = data.get("preferences")

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Personal Details ───
@router.put("/{user_id}/personal")
async def update_personal(user_id: str, data: PersonalDetails, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        db.collection("users").document(user_id).update({
            "name": data.name,
            "surname": data.surname,
            "dob": data.dob,
        })
        return {"message": "Personal details updated successfully"}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update License Details ───
@router.put("/{user_id}/license")
async def update_license(user_id: str, data: LicenseDetails, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        
        # Update license in main user document
        db.collection("users").document(user_id).update({
            "license": {
                "licenseType": data.licenseType,
                "issueDate": data.issueDate,
                "expiryDate": data.expiryDate,
                "issuingState": data.issuingState,
                "isInternational": data.isInternational,
            }
        })

        # Auto create document record for reminder system
        existing_docs = db.collection("users").document(user_id).collection("documents")\
            .where("documentType", "==", "Driving License").stream()
        
        existing_list = list(existing_docs)

        if existing_list:
            # Update existing driving license document
            existing_list[0].reference.update({
                "expiryDate": data.expiryDate,
                "documentName": f"{data.licenseType} Driving License",
            })
        else:
            # Create new driving license document
            db.collection("users").document(user_id).collection("documents").add({
                "documentType": "Driving License",
                "documentName": f"{data.licenseType} Driving License",
                "expiryDate": data.expiryDate,
                "fileUrl": None,
                "notes": f"Issued by {data.issuingState}",
                "autoCreated": True,
            })

        return {"message": "License details updated successfully"}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Preferences ───
@router.put("/{user_id}/preferences")
async def update_preferences(user_id: str, data: PreferencesDetails, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
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
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))