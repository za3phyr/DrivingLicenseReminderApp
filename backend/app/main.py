from fastapi import FastAPI
from app.routers import auth, profile, vehicles, documents, reminders

app = FastAPI(title="Driving License Renewal App API")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(reminders.router, prefix="/reminders", tags=["Reminders"])

@app.get("/")
def root():
    return {"message": "Driving License Renewal App API is running"}