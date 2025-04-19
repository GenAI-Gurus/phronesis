"""
Life Theme API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.life_theme import LifeTheme
from app.schemas.life_theme import LifeThemeCreate, LifeThemeUpdate, LifeThemeRead
from uuid import uuid4
from typing import Optional

router = APIRouter()


@router.get("/life-theme", response_model=Optional[LifeThemeRead])
def get_life_theme(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    theme = (
        db.query(LifeTheme)
        .filter_by(user_id=str(current_user.id))
        .order_by(LifeTheme.updated_at.desc())
        .first()
    )
    return theme


@router.post(
    "/life-theme", response_model=LifeThemeRead, status_code=status.HTTP_201_CREATED
)
def set_life_theme(
    theme_in: LifeThemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only one active theme per user: create new, do not update previous
    theme = LifeTheme(
        id=str(uuid4()),
        user_id=str(current_user.id),
        theme_text=theme_in.theme_text,
    )
    db.add(theme)
    db.commit()
    db.refresh(theme)
    return theme
