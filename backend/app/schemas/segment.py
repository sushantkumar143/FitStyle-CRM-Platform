from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class SegmentFilter(BaseModel):
    field: str
    operator: str
    value: Any


class SegmentCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    filters: List[SegmentFilter]
    limit: Optional[int] = None
    sort_by: Optional[str] = None


class SegmentPreviewRequest(BaseModel):
    filters: List[SegmentFilter]
    limit: Optional[int] = None
    sort_by: Optional[str] = None


class AISegmentRequest(BaseModel):
    query: str


class SegmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    filters: Any
    customer_count: int
    created_by: int
    created_at: datetime
    limit: Optional[int] = None
    sort_by: Optional[str] = None

    class Config:
        from_attributes = True


class SegmentPreviewResponse(BaseModel):
    customer_count: int
    filters: List[SegmentFilter]
    sample_customers: List[dict] = []
    limit: Optional[int] = None
    sort_by: Optional[str] = None
