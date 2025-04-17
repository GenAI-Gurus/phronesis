# Gamification SQLAlchemy models
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from .user import Base


class UserStreak(Base):
    __tablename__ = "user_streaks"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    streak_count = Column(Integer, default=0)
    last_checkin = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User")


class Badge(Base):
    __tablename__ = "badges"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(1024), nullable=False)


class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    badge_id = Column(String(36), ForeignKey("badges.id"), nullable=False)
    awarded_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User")
    badge = relationship("Badge")


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(1024), nullable=False)
    is_active = Column(Boolean, default=True)


class UserChallenge(Base):
    __tablename__ = "user_challenges"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(String(36), ForeignKey("challenges.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User")
    challenge = relationship("Challenge")
