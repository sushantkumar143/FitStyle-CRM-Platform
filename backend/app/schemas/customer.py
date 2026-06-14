from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    city: Optional[str] = None
    created_at: datetime
    total_spend: Optional[float] = None
    order_count: Optional[int] = None

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    customers: List[CustomerResponse]
    total: int
    page: int
    page_size: int


class CustomerSummary(BaseModel):
    total_spend: float
    order_count: int
    favorite_category: str
    avg_order_value: float
    last_purchase_date: Optional[str] = None
    churn_risk: str
    purchase_behavior: str
    top_products: List[str]
