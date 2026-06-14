from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    segment_id = Column(Integer, ForeignKey("segments.id"), nullable=False)
    channel = Column(String(50), nullable=False)
    status = Column(String(50), default="DRAFT")
    subject = Column(String(500), nullable=True)
    generated_message = Column(Text, nullable=True)
    audience_size = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    segment = relationship("Segment", lazy="selectin")
    messages = relationship("CampaignMessage", back_populates="campaign", lazy="selectin")
    events = relationship("CampaignEvent", back_populates="campaign", lazy="dynamic")


class CampaignMessage(Base):
    __tablename__ = "campaign_messages"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING")
    sent_at = Column(DateTime(timezone=True), nullable=True)

    campaign = relationship("Campaign", back_populates="messages")
    customer = relationship("Customer", lazy="selectin")
