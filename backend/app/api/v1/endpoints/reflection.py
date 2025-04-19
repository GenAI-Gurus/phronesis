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
import openai

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

    # Debug: print all entries for the user
    all_entries = (
        db.query(DecisionJournalEntry).filter_by(user_id=str(current_user.id)).all()
    )
    print(
        f"[DEBUG] generate_reflection_prompts: entry_id={request.entry_id}, user_id={current_user.id}, all_entries={[{'id': e.id, 'user_id': e.user_id} for e in all_entries]}"
    )
    entry = (
        db.query(DecisionJournalEntry)
        .filter_by(id=str(request.entry_id), user_id=str(current_user.id))
        .first()
    )
    print(f"[DEBUG] generate_reflection_prompts: entry query result: {entry}")
    if not entry:
        print(
            f"[DEBUG] Decision journal entry not found for id={request.entry_id}, user_id={current_user.id}"
        )
        raise HTTPException(status_code=404, detail="Decision journal entry not found")

    # Reason: Integrate with OpenAI API if configured, otherwise mock
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            openai.api_key = openai_api_key
            # Reason: Use ChatCompletion for robust prompt generation
            system_prompt = "You are a decision coach. Generate 3 concise, thoughtful reflection questions for the user, based on the following decision journal entry."
            user_content = f"Title: {entry.title}\n"
            if entry.context:
                user_content += f"Context: {entry.context}\n"
            if entry.anticipated_outcomes:
                user_content += f"Anticipated Outcomes: {entry.anticipated_outcomes}\n"
            if entry.values:
                user_content += f"Values: {', '.join(entry.values)}\n"
            if entry.domain:
                user_content += f"Domain: {entry.domain}\n"
            response = openai.ChatCompletion.create(
                model="gpt-4.1-nano",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                max_tokens=256,
                n=1,
                temperature=0.7,
            )
            # Reason: Expect model to return numbered or bulleted questions
            import re

            ai_output = response.choices[0].message.content.strip()

            def clean_prompt(line: str) -> str:
                # Remove leading numbers, dashes, bullets, whitespace
                return re.sub(r"^(\s*[-•\d]+[\.)]?\s*)", "", line).strip()

            prompts = [
                clean_prompt(q) for q in ai_output.split("\n") if clean_prompt(q)
            ]
            # Filter to 3 questions max
            prompts = prompts[:3]
            if not prompts or len(prompts) < 2:
                # Fallback if model output is not as expected
                raise ValueError("OpenAI did not return enough prompts")
        except Exception as e:
            print(f"[ERROR] OpenAI API failed: {e}")
            # Fallback to static prompts
            prompts = [
                f"Reflect on your decision: '{entry.title}'.",
                "What was your main motivation?",
                "What would you do differently next time?",
            ]
    else:
        # Mock prompts for local/dev/testing
        prompts = [
            f"Reflect on your decision: '{entry.title}'.",
            "What was your main motivation?",
            "What would you do differently next time?",
        ]
    return ReflectionPromptResponse(prompts=prompts, ai_generated=True)
