from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, func
from app.core.database import Base


class Segment(Base):
    __tablename__ = "segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    filters = Column(JSON, nullable=False)
    limit = Column(Integer, nullable=True)
    sort_by = Column(String(50), nullable=True)
    customer_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
