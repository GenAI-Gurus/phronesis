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
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
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
        domain (str): (Deprecated) Single auto-tagged domain (e.g., career, health).
        sentiment (str): (Deprecated) Single auto-analyzed sentiment.
        domain_tags (list): List of detected domains.
        sentiment_tag (str): Detected sentiment.
        keywords (list): Extracted keywords/topics.
        created_at (datetime): Creation timestamp.
        updated_at (datetime): Last update timestamp.
    """

    __tablename__ = "decision_journal_entries"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    context = Column(String, nullable=True)
    anticipated_outcomes = Column(String, nullable=True)
    values = Column(JSON, nullable=True)  # Store as JSON array
    domain = Column(String, nullable=True)  # Deprecated
    sentiment = Column(String, nullable=True)  # Deprecated
    domain_tags = Column(JSON, nullable=True)  # List of strings
    sentiment_tag = Column(String, nullable=True)
    keywords = Column(JSON, nullable=True)  # List of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    user = relationship("User")
