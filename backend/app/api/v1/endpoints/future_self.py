"""
Future-Self Simulator API endpoint.
POST /api/v1/future-self/simulate
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.future_self import (
    FutureSelfSimulationRequest,
    FutureSelfSimulationResponse,
)
from typing import List
import os

router = APIRouter()


@router.post(
    "/simulate", response_model=FutureSelfSimulationResponse, tags=["future-self"]
)
def simulate_future_self(
    req: FutureSelfSimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FutureSelfSimulationResponse:
    """
    Simulate user's future self based on a decision context, values, and optional time horizon.
    Uses OpenAI LLM (if configured) or returns a mock response.
    """
    # Reason: In production, call OpenAI API here. For now, return a mock response.
    # TODO: Integrate with OpenAI and add error handling.
    projection = (
        f"In {req.time_horizon or 'the future'}, after making your decision, you experience growth and new opportunities. "
        f"Your values ({', '.join(req.values or [])}) guide your journey."
    )
    suggestions = [
        "Reflect on your long-term goals.",
        "Seek advice from trusted mentors.",
        "Consider how this decision aligns with your values.",
    ]
    return FutureSelfSimulationResponse(
        future_projection=projection, suggestions=suggestions, ai_generated=True
    )
