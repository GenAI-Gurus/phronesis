import os
import logging
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


class DecisionSupportMessage(BaseModel):
    role: str = Field(..., description="user or ai")
    content: str


class DecisionSupportRequest(BaseModel):
    messages: List[DecisionSupportMessage]
    context: Optional[str] = Field(None, description="Optional context or metadata")


class DecisionSupportResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None


# --- OpenAI GPT-4.1-nano integration ---
try:
    import openai
except ImportError:
    openai = None

OPENAI_MODEL = "gpt-4.1-nano"  # GPT-4.1-nano model


@router.post("/chat", response_model=DecisionSupportResponse)
def decision_support_chat(
    req: DecisionSupportRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Decision support chat using OpenAI GPT-4.1-nano (if configured). Falls back to mock reply if OpenAI fails or not configured.
    """
    if not req.messages or req.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user.")
    last_user_msg = req.messages[-1].content
    api_key = os.getenv("OPENAI_API_KEY")
    try:
        if openai is not None and api_key:
            openai.api_key = api_key
            client = openai.OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": m.role, "content": m.content} for m in req.messages],
                max_tokens=512,
                temperature=0.7,
            )
            ai_reply = response.choices[0].message["content"].strip()
            # Optionally extract suggestions from reply (if structured)
            return DecisionSupportResponse(reply=ai_reply, suggestions=None)
        else:
            raise RuntimeError("OpenAI API key not set or openai not installed.")
    except Exception as e:
        logging.exception("OpenAI DecisionSupport chat failed: %s", e)
        # Fallback mock
        reply = (
            "I'm here to help you think through your decision. "
            "Here are a few steps that might help: "
            "1. Clarify what decision you need to make. "
            "2. List your main options and possible outcomes. "
            "3. Reflect on which choice aligns best with your values and goals. "
            "Would you like to talk through any of these steps or share more about your situation?"
        )
        suggestions = [
            "Clarify your goals",
            "Consider possible outcomes",
            "Reflect on your values",
        ]
        return DecisionSupportResponse(reply=reply, suggestions=suggestions)
