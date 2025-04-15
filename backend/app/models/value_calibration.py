# ValueCalibrationCheckin SQLAlchemy model
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from .user import Base

class ValueCalibrationCheckin(Base):
    __tablename__ = "value_calibration_checkins"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    value_snapshot = Column(String, nullable=False)  # JSON string or serialized values
    user = relationship("User")
