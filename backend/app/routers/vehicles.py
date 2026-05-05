from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def vehicles_root():
    return {"message": "Vehicles router working"}