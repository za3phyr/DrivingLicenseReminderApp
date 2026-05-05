from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def documents_root():
    return {"message": "Documents router working"}