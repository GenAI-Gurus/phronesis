from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class ValueCalibrationCheckinBase(BaseModel):
    value_snapshot: str = Field(
        ..., description="Serialized user values at check-in (JSON string)"
    )


class ValueCalibrationCheckinCreate(ValueCalibrationCheckinBase):
    pass


class ValueCalibrationCheckinRead(ValueCalibrationCheckinBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
