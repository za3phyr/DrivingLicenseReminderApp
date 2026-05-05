from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.firebase import db
from firebase_admin import firestore
from datetime import datetime
from typing import Optional

router = APIRouter()

# ─── Models ───
class ReminderSettings(BaseModel):
    emailNotif: bool
    pushNotif: bool
    threeMonthsReminder: bool
    oneMonthReminder: bool
    oneWeekReminder: bool
    threeDaysReminder: bool

# ─── Get Reminders ───
@router.get("/{user_id}")
async def get_reminders(user_id: str):
    try:
        # Get all documents for the user
        docs = db.collection("users").document(user_id).collection("documents").stream()
        reminders = []

        for doc in docs:
            data = doc.to_dict()
            expiry_str = data.get("expiryDate")

            if not expiry_str:
                continue

            # Calculate days remaining
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
                status = "Upcoming"
                colour = "gray"
            else:
                status = "Valid"
                colour = "gray"

            reminders.append({
                "documentId": doc.id,
                "documentName": data.get("documentName"),
                "documentType": data.get("documentType"),
                "expiryDate": expiry_str,
                "daysRemaining": days_remaining,
                "status": status,
                "colour": colour
            })

        # Sort by days remaining
        reminders.sort(key=lambda x: x["daysRemaining"])

        return {"reminders": reminders}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Reminder Settings ───
@router.put("/{user_id}")
async def update_reminder_settings(user_id: str, data: ReminderSettings):
    try:
        db.collection("users").document(user_id).update({
            "reminderSettings": {
                "emailNotif": data.emailNotif,
                "pushNotif": data.pushNotif,
                "threeMonthsReminder": data.threeMonthsReminder,
                "oneMonthReminder": data.oneMonthReminder,
                "oneWeekReminder": data.oneWeekReminder,
                "threeDaysReminder": data.threeDaysReminder,
            }
        })
        return {"message": "Reminder settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))