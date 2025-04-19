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
import logging
import os
import openai

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
    openai_api_key = os.getenv("OPENAI_API_KEY")
    prompt = (
        f"You are an AI designed to help users envision their future self. "
        f"Given the following decision context: '{req.decision_context}', "
        f"core values: {', '.join(req.values) if req.values else 'N/A'}, "
        f"and time horizon: {req.time_horizon or 'the future'}, "
        f"generate a personalized, thoughtful future projection and 2-3 actionable suggestions for this user."
    )
    try:
        if not openai_api_key:
            raise RuntimeError("OpenAI API key not set.")
        openai.api_key = openai_api_key
        response = openai.ChatCompletion.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": "You are a life coach AI."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=512,
            temperature=0.7,
        )
        ai_text = response.choices[0].message["content"].strip()
        # Simple split: projection is first paragraph, suggestions are bullets after
        if "Suggestions:" in ai_text:
            projection, suggestions_block = ai_text.split("Suggestions:", 1)
            suggestions = [
                s.strip("- ")
                for s in suggestions_block.strip().split("\n")
                if s.strip()
            ]
        else:
            projection = ai_text
            suggestions = []
        return FutureSelfSimulationResponse(
            future_projection=projection.strip(),
            suggestions=suggestions,
            ai_generated=True,
        )
    except Exception as e:
        logging.exception("OpenAI FutureSelf simulation failed: %s", e)
        # Fallback to mock
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
            future_projection=projection, suggestions=suggestions, ai_generated=False
        )
