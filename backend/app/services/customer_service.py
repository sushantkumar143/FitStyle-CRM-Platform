from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, desc
from sqlalchemy.orm import selectinload
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from typing import Optional


async def get_customers(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    city: Optional[str] = None,
):
    query = select(Customer)

    if search:
        query = query.where(
            (Customer.name.ilike(f"%{search}%")) |
            (Customer.email.ilike(f"%{search}%"))
        )
    if city:
        query = query.where(Customer.city == city)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.order_by(desc(Customer.created_at))
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    customers = result.scalars().all()

    # Enrich with spend and order count
    enriched = []
    for c in customers:
        spend_result = await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .where(Order.customer_id == c.id)
        )
        total_spend = spend_result.scalar() or 0

        count_result = await db.execute(
            select(func.count()).where(Order.customer_id == c.id)
        )
        order_count = count_result.scalar() or 0

        enriched.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "city": c.city,
            "created_at": c.created_at,
            "total_spend": round(total_spend, 2),
            "order_count": order_count,
        })

    return enriched, total


async def get_customer_by_id(db: AsyncSession, customer_id: int):
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    return result.scalar_one_or_none()


async def get_customer_stats(db: AsyncSession, customer_id: int) -> dict:
    # Total spend
    spend_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.customer_id == customer_id)
    )
    total_spend = spend_result.scalar() or 0

    # Order count
    count_result = await db.execute(
        select(func.count()).where(Order.customer_id == customer_id)
    )
    order_count = count_result.scalar() or 0

    # Last purchase
    last_result = await db.execute(
        select(func.max(Order.order_date)).where(Order.customer_id == customer_id)
    )
    last_purchase = last_result.scalar()

    # Favorite category
    cat_result = await db.execute(
        select(Product.category, func.count().label("cnt"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.customer_id == customer_id)
        .group_by(Product.category)
        .order_by(desc("cnt"))
        .limit(1)
    )
    cat_row = cat_result.first()
    favorite_category = cat_row[0] if cat_row else "N/A"

    # Top products
    prod_result = await db.execute(
        select(Product.name, func.count().label("cnt"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.customer_id == customer_id)
        .group_by(Product.name)
        .order_by(desc("cnt"))
        .limit(5)
    )
    top_products = [row[0] for row in prod_result.all()]

    avg_order = round(total_spend / order_count, 2) if order_count > 0 else 0

    # Churn risk based on recency
    from datetime import datetime, timezone, timedelta
    churn_risk = "Low"
    if last_purchase:
        days_since = (datetime.now(timezone.utc) - last_purchase).days
        if days_since > 90:
            churn_risk = "High"
        elif days_since > 60:
            churn_risk = "Medium"
    else:
        churn_risk = "High"

    # Purchase behavior
    if order_count >= 10 and total_spend >= 20000:
        behavior = "Loyal high-value customer with frequent purchases"
    elif order_count >= 5:
        behavior = "Regular customer with consistent purchasing pattern"
    elif total_spend >= 10000:
        behavior = "High-value occasional buyer"
    else:
        behavior = "Casual buyer with room for engagement"

    return {
        "total_spend": round(total_spend, 2),
        "order_count": order_count,
        "favorite_category": favorite_category,
        "avg_order_value": avg_order,
        "last_purchase_date": last_purchase.isoformat() if last_purchase else None,
        "churn_risk": churn_risk,
        "purchase_behavior": behavior,
        "top_products": top_products,
    }
