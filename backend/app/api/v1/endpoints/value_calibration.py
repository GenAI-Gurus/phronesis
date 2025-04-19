"""
Value Calibration Check-in API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.value_calibration import ValueCalibrationCheckin
from app.schemas.value_calibration import (
    ValueCalibrationCheckinCreate,
    ValueCalibrationCheckinOut,
)
import uuid
import datetime

router = APIRouter()


@router.post("/checkins", response_model=ValueCalibrationCheckinOut, status_code=201)
def create_checkin(
    checkin_in: ValueCalibrationCheckinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    checkin = ValueCalibrationCheckin(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        created_at=datetime.datetime.utcnow(),
        value_snapshot=checkin_in.value_snapshot,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin


@router.get("/checkins", response_model=List[ValueCalibrationCheckinOut])
def list_checkins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ValueCalibrationCheckin)
        .filter(ValueCalibrationCheckin.user_id == str(current_user.id))
        .order_by(ValueCalibrationCheckin.created_at.desc())
        .all()
    )
