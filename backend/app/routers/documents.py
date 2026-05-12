from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator
from app.services.firebase import db
from app.services.jwt import verify_token
from firebase_admin import firestore
from typing import Optional
import re
from datetime import datetime

router = APIRouter()

# ─── Models ───
class DocumentModel(BaseModel):
    documentType: str
    documentName: str
    expiryDate: str
    fileUrl: Optional[str] = None
    notes: Optional[str] = None

    @validator('documentType')
    def validate_document_type(cls, v):
        valid_types = [
            'Driving License',
            'Vehicle Registration',
            'Road Tax',
            'Insurance',
            'MOT Certificate',
            'Other'
        ]
        if v not in valid_types:
            raise ValueError(f'Document type must be one of: {", ".join(valid_types)}')
        return v

    @validator('documentName')
    def validate_document_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Document name must be at least 2 characters long')
        if len(v.strip()) > 100:
            raise ValueError('Document name must be at most 100 characters long')
        return v

    @validator('expiryDate')
    def validate_expiry_date(cls, v):
        pattern = r'^\d{2}/\d{2}/\d{4}$'
        if not re.match(pattern, v):
            raise ValueError('Expiry date must be in DD/MM/YYYY format')
        try:
            datetime.strptime(v, "%d/%m/%Y")
        except ValueError:
            raise ValueError('Please enter a valid expiry date')
        return v

    @validator('notes')
    def validate_notes(cls, v):
        if v and len(v) > 500:
            raise ValueError('Notes must be at most 500 characters long')
        return v

# ─── Get All Documents ───
@router.get("/{user_id}")
async def get_documents(user_id: str, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        docs = db.collection("users").document(user_id).collection("documents").stream()
        result = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            result.append(d)
        return {"documents": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Add Document ───
@router.post("/{user_id}")
async def add_document(user_id: str, data: DocumentModel, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        doc_ref = db.collection("users").document(user_id).collection("documents").document()
        doc_ref.set({
            "documentType": data.documentType,
            "documentName": data.documentName,
            "expiryDate": data.expiryDate,
            "fileUrl": data.fileUrl,
            "notes": data.notes,
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        return {
            "message": "Document added successfully",
            "documentId": doc_ref.id
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Document ───
@router.put("/{user_id}/{document_id}")
async def update_document(user_id: str, document_id: str, data: DocumentModel, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        db.collection("users").document(user_id).collection("documents").document(document_id).update({
            "documentType": data.documentType,
            "documentName": data.documentName,
            "expiryDate": data.expiryDate,
            "fileUrl": data.fileUrl,
            "notes": data.notes,
        })
        return {"message": "Document updated successfully"}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Delete Document ───
@router.delete("/{user_id}/{document_id}")
async def delete_document(user_id: str, document_id: str, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        db.collection("users").document(user_id).collection("documents").document(document_id).delete()
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Get Document Status ───
@router.get("/{user_id}/{document_id}/status")
async def get_document_status(user_id: str, document_id: str, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
        doc = db.collection("users").document(user_id).collection("documents").document(document_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")

        data = doc.to_dict()
        expiry_str = data.get("expiryDate")

        expiry_date = datetime.strptime(expiry_str, "%d/%m/%Y")
        today = datetime.today()
        days_remaining = (expiry_date - today).days

        if days_remaining < 0:
            status = "Expired"
            colour = "red"
        elif days_remaining <= 3:
            status = "Critical"
            colour = "red"
        elif days_remaining <= 7:
            status = "Warning"
            colour = "orange"
        elif days_remaining <= 30:
            status = "Reminder"
            colour = "blue"
        else:
            status = "Valid"
            colour = "gray"

        return {
            "documentId": document_id,
            "expiryDate": expiry_str,
            "daysRemaining": days_remaining,
            "status": status,
            "colour": colour
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))