from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    product_category: Optional[str] = None
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    total_amount: float
    order_date: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    page_size: int
