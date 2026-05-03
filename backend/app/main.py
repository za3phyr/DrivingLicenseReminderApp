from fastapi import FastAPI

app = FastAPI(title="Driving License Renewal App API")

@app.get("/")
def root():
    return {"message": "Driving License Renewal App API is running"}