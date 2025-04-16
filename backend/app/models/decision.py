# DecisionChatSession SQLAlchemy model
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
import enum
from .user import Base
from sqlalchemy import JSON


class SessionStatus(enum.Enum):
    context_gathering = "context_gathering"
    reflection = "reflection"
    completed = "completed"


class DecisionChatSession(Base):
    __tablename__ = "decision_chat_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)  # Added title column
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.context_gathering)
    summary = Column(String, nullable=True)
    insights = Column(String, nullable=True)
    user = relationship("User")


class DecisionJournalEntry(Base):
    """
    SQLAlchemy model for a user's decision journal entry.

    Fields:
        id (UUID): Primary key.
        user_id (UUID): Foreign key to User.
        title (str): Title of the decision.
        context (str): Context or background for the decision.
        anticipated_outcomes (str): Anticipated outcomes.
        values (list): List of values touched by the decision.
        domain (str): Auto-tagged domain (e.g., career, health).
        sentiment (str): Auto-analyzed sentiment.
        created_at (datetime): Creation timestamp.
        updated_at (datetime): Last update timestamp.
    """
    __tablename__ = "decision_journal_entries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    context = Column(String, nullable=True)
    anticipated_outcomes = Column(String, nullable=True)
    values = Column(JSON, nullable=True)  # Store as JSON array
    domain = Column(String, nullable=True)
    sentiment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    user = relationship("User")
