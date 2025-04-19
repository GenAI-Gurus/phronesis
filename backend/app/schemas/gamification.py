from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BadgeRead(BaseModel):
    id: str
    name: str
    description: str
    awarded_at: Optional[datetime] = None


class StreakRead(BaseModel):
    id: str
    streak_count: int
    last_checkin: datetime


class ChallengeRead(BaseModel):
    id: str
    name: str
    description: str
    is_active: bool
    completed_at: Optional[datetime] = None


class ChallengeCompleteRequest(BaseModel):
    challenge_id: str
