from pydantic import BaseModel
from typing import List


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
