from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.firebase import db
from firebase_admin import firestore
from typing import Optional

router = APIRouter()

# ─── Models ───
class DocumentModel(BaseModel):
    documentType: str
    documentName: str
    expiryDate: str
    fileUrl: Optional[str] = None
    notes: Optional[str] = None

# ─── Get All Documents ───
@router.get("/{user_id}")
async def get_documents(user_id: str):
    try:
        docs = db.collection("users").document(user_id).collection("documents").stream()
        result = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            result.append(d)
        return {"documents": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Add Document ───
@router.post("/{user_id}")
async def add_document(user_id: str, data: DocumentModel):
    try:
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Document ───
@router.put("/{user_id}/{document_id}")
async def update_document(user_id: str, document_id: str, data: DocumentModel):
    try:
        db.collection("users").document(user_id).collection("documents").document(document_id).update({
            "documentType": data.documentType,
            "documentName": data.documentName,
            "expiryDate": data.expiryDate,
            "fileUrl": data.fileUrl,
            "notes": data.notes,
        })
        return {"message": "Document updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Delete Document ───
@router.delete("/{user_id}/{document_id}")
async def delete_document(user_id: str, document_id: str):
    try:
        db.collection("users").document(user_id).collection("documents").document(document_id).delete()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Get Document Status ───
@router.get("/{user_id}/{document_id}/status")
async def get_document_status(user_id: str, document_id: str):
    try:
        from datetime import datetime
        doc = db.collection("users").document(user_id).collection("documents").document(document_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")
        
        data = doc.to_dict()
        expiry_str = data.get("expiryDate")
        
        # Parse expiry date
        expiry_date = datetime.strptime(expiry_str, "%d/%m/%Y")
        today = datetime.today()
        days_remaining = (expiry_date - today).days

        # Determine status and colour
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
        elif days_remaining <= 90:
            status = "Valid"
            colour = "gray"
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