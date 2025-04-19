"""
Gamification API endpoints: streaks, badges, challenges
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.gamification import (
    UserStreak,
    UserBadge,
    Badge,
    Challenge,
    UserChallenge,
)
from app.schemas.gamification import (
    BadgeRead,
    StreakRead,
    ChallengeRead,
    ChallengeCompleteRequest,
)
from typing import List
from datetime import datetime

router = APIRouter()


@router.get("/streaks", response_model=List[StreakRead], tags=["gamification"])
def get_streaks(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    streaks = db.query(UserStreak).filter_by(user_id=current_user.id).all()
    return [
        StreakRead(id=s.id, streak_count=s.streak_count, last_checkin=s.last_checkin)
        for s in streaks
    ]


@router.get("/badges", response_model=List[BadgeRead], tags=["gamification"])
def get_badges(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    user_badges = db.query(UserBadge).filter_by(user_id=current_user.id).all()
    return [
        BadgeRead(
            id=ub.badge.id,
            name=ub.badge.name,
            description=ub.badge.description,
            awarded_at=ub.awarded_at,
        )
        for ub in user_badges
    ]


@router.get("/challenges", response_model=List[ChallengeRead], tags=["gamification"])
def get_challenges(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    user_challenges = db.query(UserChallenge).filter_by(user_id=current_user.id).all()
    result = []
    for uc in user_challenges:
        result.append(
            ChallengeRead(
                id=uc.challenge.id,
                name=uc.challenge.name,
                description=uc.challenge.description,
                is_active=uc.challenge.is_active,
                completed_at=uc.completed_at,
            )
        )
    return result


@router.post(
    "/challenges/{challenge_id}/complete",
    response_model=ChallengeRead,
    tags=["gamification"],
)
def complete_challenge(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uc = (
        db.query(UserChallenge)
        .filter_by(user_id=current_user.id, challenge_id=challenge_id)
        .first()
    )
    if not uc:
        raise HTTPException(status_code=404, detail="Challenge not found for user")
    if uc.completed_at:
        raise HTTPException(status_code=400, detail="Challenge already completed")
    uc.completed_at = datetime.utcnow()
    db.commit()
    c = uc.challenge
    return ChallengeRead(
        id=c.id,
        name=c.name,
        description=c.description,
        is_active=c.is_active,
        completed_at=uc.completed_at,
    )
