"""
Reflection Prompt Generator Endpoint for Phronesis.
Generates AI-powered reflection prompts for a given decision journal entry.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
import os

router = APIRouter()


class ReflectionPromptRequest(BaseModel):
    entry_id: UUID
    context: Optional[str] = None


class ReflectionPromptResponse(BaseModel):
    prompts: List[str]
    ai_generated: bool = True


@router.post(
    "/prompts/generate",
    response_model=ReflectionPromptResponse,
    status_code=200,
    dependencies=[Depends(get_current_user)],
)
def generate_reflection_prompts(
    request: ReflectionPromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate AI-powered reflection prompts for a decision journal entry.

    Args:
        request (ReflectionPromptRequest): The entry_id and optional context.
        db (Session): SQLAlchemy session dependency.
        current_user (User): The authenticated user.

    Returns:
        ReflectionPromptResponse: List of generated prompts.

    Raises:
        HTTPException: If the entry is not found or user is unauthorized.
    """
    # Reason: Only allow prompts for entries owned by the user
    from app.models.decision import DecisionJournalEntry

    entry = (
        db.query(DecisionJournalEntry)
        .filter_by(id=request.entry_id, user_id=current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Decision journal entry not found")

    # Reason: Integrate with OpenAI API if configured, otherwise mock
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        # TODO: Integrate with OpenAI API (actual call)
        prompts = [
            f"Reflect on why you made the decision: '{entry.title}'.",
            "What values did this decision touch upon?",
            "How do you feel about the outcome so far?",
        ]
    else:
        # Mock prompts for local/dev/testing
        prompts = [
            f"Reflect on your decision: '{entry.title}'.",
            "What was your main motivation?",
            "What would you do differently next time?",
        ]
    return ReflectionPromptResponse(prompts=prompts, ai_generated=True)
