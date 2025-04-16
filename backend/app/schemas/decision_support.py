from pydantic import BaseModel, Field
from typing import List, Optional

class DecisionSupportMessage(BaseModel):
    role: str = Field(..., description="user or ai")
    content: str

class DecisionSupportRequest(BaseModel):
    messages: List[DecisionSupportMessage]
    context: Optional[str] = Field(None, description="Optional context or metadata")

class DecisionSupportResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None
