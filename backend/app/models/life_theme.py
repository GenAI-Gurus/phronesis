from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.user import Base
import datetime


class LifeTheme(Base):
    __tablename__ = "life_themes"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    theme_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    user = relationship("User", back_populates="life_themes")
