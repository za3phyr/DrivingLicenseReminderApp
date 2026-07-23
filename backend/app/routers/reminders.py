from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.firebase import db
from app.services.jwt import verify_token
from datetime import datetime

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
async def get_reminders(user_id: str, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")

        docs = db.collection("users").document(user_id).collection("documents").stream()
        reminders = []

        for doc in docs:
            data = doc.to_dict()
            expiry_str = data.get("expiryDate")

            if not expiry_str:
                continue

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

        reminders.sort(key=lambda x: x["daysRemaining"])

        return {"reminders": reminders}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Update Reminder Settings ───
@router.put("/{user_id}")
async def update_reminder_settings(user_id: str, data: ReminderSettings, token: dict = Depends(verify_token)):
    try:
        if token.get("uid") != user_id:
            raise HTTPException(status_code=403, detail="Access denied.")
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))