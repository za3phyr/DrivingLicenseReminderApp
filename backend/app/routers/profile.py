from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def profile_root():
    return {"message": "Profile router working"}