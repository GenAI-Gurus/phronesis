# DecisionChatSession SQLAlchemy model
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
import enum
from .user import Base


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
