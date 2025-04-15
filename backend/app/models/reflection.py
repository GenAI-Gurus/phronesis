# DecisionChatMessage SQLAlchemy model
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
import enum
from .user import Base

class MessageType(enum.Enum):
    context = "context"
    reflection = "reflection"
    ai = "ai"
    user = "user"

class DecisionChatMessage(Base):
    __tablename__ = "decision_chat_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("decision_chat_sessions.id"), nullable=False)
    sender = Column(Enum(MessageType), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    session = relationship("DecisionChatSession")
