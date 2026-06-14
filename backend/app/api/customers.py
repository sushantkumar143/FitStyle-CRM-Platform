from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.customer import CustomerListResponse, CustomerResponse, CustomerSummary
from app.services.customer_service import get_customers, get_customer_by_id, get_customer_stats
from app.services.ai_service import generate_customer_summary
from typing import Optional

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("")
async def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    customers, total = await get_customers(db, page, page_size, search, city)
    return {"customers": customers, "total": total, "page": page, "page_size": page_size}


@router.get("/{customer_id}")
async def get_customer(
    customer_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    customer = await get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    stats = await get_customer_stats(db, customer_id)
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "city": customer.city,
        "created_at": customer.created_at,
        **stats,
    }


@router.get("/{customer_id}/summary")
async def get_customer_ai_summary(
    customer_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    customer = await get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    stats = await get_customer_stats(db, customer_id)
    ai_summary = generate_customer_summary(stats)
    return {"stats": stats, "ai_summary": ai_summary}
