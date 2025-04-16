import os
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

# --- OpenAI GPT-4.1 integration ---
try:
    import openai
except ImportError:
    openai = None

OPENAI_MODEL = "gpt-4-1106-preview"  # GPT-4.1 model

@router.post("/chat", response_model=DecisionSupportResponse)
def decision_support_chat(
    req: DecisionSupportRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Decision support chat using OpenAI GPT-4.1 (gpt-4-1106-preview).
    Falls back to mock reply if OpenAI fails or not configured.
    """
    if not req.messages or req.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user.")
    last_user_msg = req.messages[-1].content
    api_key = os.getenv("OPENAI_API_KEY")
    if openai is not None and api_key:
        try:
            openai_client = openai.OpenAI(api_key=api_key)
            chat_history = [
                {"role": m.role, "content": m.content}
                for m in req.messages
            ]
            response = openai_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=chat_history,
                max_tokens=256,
                temperature=0.7,
            )
            reply = response.choices[0].message.content.strip()
            # Optionally, extract suggestions from the reply (future work)
            suggestions = [
                "Clarify your goals",
                "Consider possible outcomes",
                "Reflect on your values"
            ]
            return DecisionSupportResponse(reply=reply, suggestions=suggestions)
        except Exception as e:
            # Fallback to mock reply on error
            reply = f"AI (fallback): I see you said '{last_user_msg}'. How can I help you think this through? (OpenAI error: {e})"
            suggestions = [
                "Clarify your goals",
                "Consider possible outcomes",
                "Reflect on your values"
            ]
            return DecisionSupportResponse(reply=reply, suggestions=suggestions)
    else:
        # Fallback if OpenAI not installed or no API key
        reply = f"AI (mock): I see you said '{last_user_msg}'. How can I help you think this through? (OpenAI not configured)"
        suggestions = [
            "Clarify your goals",
            "Consider possible outcomes",
            "Reflect on your values"
        ]
        return DecisionSupportResponse(reply=reply, suggestions=suggestions)
