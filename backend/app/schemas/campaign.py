from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CampaignCreateRequest(BaseModel):
    name: str
    segment_id: int
    channel: str
    subject: Optional[str] = None
    generated_message: Optional[str] = None


class CampaignGenerateRequest(BaseModel):
    segment_id: int
    channel: str


class CampaignResponse(BaseModel):
    id: int
    name: str
    segment_id: int
    segment_name: Optional[str] = None
    channel: str
    status: str
    subject: Optional[str] = None
    generated_message: Optional[str] = None
    audience_size: int
    created_by: int
    created_at: datetime
    stats: Optional[dict] = None

    class Config:
        from_attributes = True


class CampaignListResponse(BaseModel):
    campaigns: List[CampaignResponse]
    total: int


class CampaignGeneratedContent(BaseModel):
    title: str
    subject: str
    message: str


class CampaignEventCreate(BaseModel):
    campaign_id: int
    customer_id: int
    message_id: Optional[int] = None
    status: str
    timestamp: Optional[datetime] = None
