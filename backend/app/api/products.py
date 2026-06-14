from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.product import Product

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
async def list_products(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Product).order_by(Product.category, Product.name))
    products = result.scalars().all()
    return {
        "products": [
            {"id": p.id, "name": p.name, "category": p.category, "price": p.price}
            for p in products
        ],
        "total": len(products),
    }
