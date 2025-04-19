from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LifeThemeBase(BaseModel):
    theme_text: str = Field(
        ...,
        min_length=1,
        max_length=512,
        description="User's current life theme or guiding principle.",
    )


class LifeThemeCreate(LifeThemeBase):
    pass


class LifeThemeUpdate(BaseModel):
    theme_text: Optional[str] = Field(None, min_length=1, max_length=512)


class LifeThemeRead(LifeThemeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
