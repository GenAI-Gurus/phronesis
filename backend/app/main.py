# backend/app/main.py
from fastapi import FastAPI

app = FastAPI(title="Phronesis API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Phronesis API!"}
