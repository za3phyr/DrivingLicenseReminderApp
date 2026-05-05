from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def reminders_root():
    return {"message": "Reminders router working"}