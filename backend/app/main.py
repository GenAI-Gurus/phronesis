# backend/app/main.py
from fastapi import FastAPI

app = FastAPI(title="Phronesis API", version="0.1.0")

# --- CORS Middleware for frontend-backend communication (dev only) ---
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict to ["http://localhost:5173"] in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.endpoints import users, auth

app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
from app.api.v1.endpoints import profile

app.include_router(profile.router, prefix="/api/v1", tags=["profile"])

from app.api.v1.endpoints import decisions

app.include_router(decisions.router, prefix="/api/v1/decisions", tags=["decisions"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Phronesis API!"}
