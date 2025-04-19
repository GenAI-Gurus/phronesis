# User SQLAlchemy model
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy import String
from sqlalchemy.orm import declarative_base
import uuid
import datetime

Base = declarative_base()


from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    life_themes = relationship(
        "LifeTheme", back_populates="user", cascade="all, delete-orphan"
    )
