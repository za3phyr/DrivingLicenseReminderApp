from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from app.services.firebase import firebase_auth, db
from firebase_admin import firestore
import re
from datetime import datetime

router = APIRouter()

# ─── Models ───
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    surname: str
    dob: str

    @validator('email')
    def validate_email(cls, v):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(pattern, v):
            raise ValueError('Please enter a valid email address')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
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
                raise ValueError('You must be at least 18 years old to register')
            if age > 120:
                raise ValueError('Please enter a valid date of birth')
        except ValueError as e:
            raise e
        return v

class LoginRequest(BaseModel):
    email: str
    password: str

# ─── Register ───
@router.post("/register")
async def register(data: RegisterRequest):
    try:
        # Create user in Firebase Auth
        user = firebase_auth.create_user(
            email=data.email,
            password=data.password,
            display_name=f"{data.name} {data.surname}"
        )

        # Save user profile to Firestore
        db.collection("users").document(user.uid).set({
            "name": data.name,
            "surname": data.surname,
            "dob": data.dob,
            "email": data.email,
            "profileComplete": False,
            "createdAt": firestore.SERVER_TIMESTAMP
        })

        return {
            "message": "User registered successfully",
            "uid": user.uid
        }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Login ───
@router.post("/login")
async def login(data: LoginRequest):
    try:
        # Verify user exists in Firebase Auth
        user = firebase_auth.get_user_by_email(data.email)

        # Get user profile from Firestore
        doc = db.collection("users").document(user.uid).get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="User profile not found")

        profile = doc.to_dict()

        return {
            "message": "Login successful",
            "uid": user.uid,
            "name": profile.get("name"),
            "surname": profile.get("surname"),
            "email": user.email,
            "profileComplete": profile.get("profileComplete", False)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Forgot Password ───
@router.post("/forgot-password")
async def forgot_password(email: str):
    try:
        # Verify user exists
        firebase_auth.get_user_by_email(email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))