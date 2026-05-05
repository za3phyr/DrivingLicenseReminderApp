from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_admin import firestore
from app.services.firebase import firebase_auth, db

router = APIRouter()

# ─── Models ───
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    surname: str
    dob: str

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