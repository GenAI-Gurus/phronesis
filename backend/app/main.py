# backend/app/main.py
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
import traceback

app = FastAPI(title="Phronesis API", version="0.1.0")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(
        f"[GLOBAL ERROR] Unhandled exception: {exc}\n{traceback.format_exc()}"
    )
    return JSONResponse(
        status_code=500, content={"detail": "Internal server error (global handler)"}
    )


# --- CORS Middleware for frontend-backend communication (dev only) ---
from fastapi.middleware.cors import CORSMiddleware

# --- CORS Middleware for frontend-backend communication (prod/dev) ---
import os

allowed_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173").split(",")
print(
    "CORS allowed origins:", allowed_origins
)  # Debug: confirm CORS origins at runtime
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Set via CORS_ALLOW_ORIGINS env var (comma-separated)
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

from app.api.v1.endpoints import reflection

app.include_router(
    reflection.router,
    prefix="/api/v1/reflection",
    tags=["reflection"],
)

from app.api.v1.endpoints import value_calibration

app.include_router(
    value_calibration.router,
    prefix="/api/v1/value-calibration",
    tags=["value-calibration"],
)

from app.api.v1.endpoints import decision_support

app.include_router(
    decision_support.router,
    prefix="/api/v1/decision-support",
    tags=["decision-support"],
)

from app.api.v1.endpoints import future_self

app.include_router(
    future_self.router,
    prefix="/api/v1/future-self",
    tags=["future-self"],
)

from app.api.v1.endpoints import gamification

app.include_router(
    gamification.router,
    prefix="/api/v1/gamification",
    tags=["gamification"],
)

from app.api.v1.endpoints import life_theme

app.include_router(
    life_theme.router,
    prefix="/api/v1",
    tags=["life-theme"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Phronesis API!"}
