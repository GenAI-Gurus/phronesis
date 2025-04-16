from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.models.user import User
from app.db.session import get_db
from app.core.security import get_current_user

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    is_superuser: bool

    class Config:
        orm_mode = True


@router.get("/me", response_model=UserProfile)
def read_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserProfile)
def update_profile(
    update: UserProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.email = update.email
    db.commit()
    db.refresh(current_user)
    return current_user
