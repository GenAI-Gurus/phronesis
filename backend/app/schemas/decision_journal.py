from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
import datetime

from pydantic import constr


class DecisionJournalEntryBase(BaseModel):
    title: constr(min_length=1)
    context: Optional[str] = None
    anticipated_outcomes: Optional[str] = None
    values: Optional[List[str]] = None


class DecisionJournalEntryCreate(DecisionJournalEntryBase):
    pass


class DecisionJournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    context: Optional[str] = None
    anticipated_outcomes: Optional[str] = None
    values: Optional[List[str]] = None


class DecisionJournalEntryOut(DecisionJournalEntryBase):
    id: UUID
    user_id: UUID
    domain: Optional[str] = None  # Deprecated
    sentiment: Optional[str] = None  # Deprecated
    domain_tags: Optional[List[str]] = None
    sentiment_tag: Optional[str] = None
    keywords: Optional[List[str]] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True
