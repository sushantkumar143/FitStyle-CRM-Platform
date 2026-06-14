from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from typing import Optional


async def get_orders(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    customer_id: Optional[int] = None,
):
    query = select(Order)

    if customer_id:
        query = query.where(Order.customer_id == customer_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(desc(Order.order_date))
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()

    enriched = []
    for order in orders:
        # Get customer name
        cust_result = await db.execute(
            select(Customer.name).where(Customer.id == order.customer_id)
        )
        customer_name = cust_result.scalar() or "Unknown"

        # Get items
        items_result = await db.execute(
            select(OrderItem, Product.name, Product.category)
            .join(Product, Product.id == OrderItem.product_id)
            .where(OrderItem.order_id == order.id)
        )
        items = []
        for item, prod_name, prod_cat in items_result.all():
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": prod_name,
                "product_category": prod_cat,
                "quantity": item.quantity,
                "price": item.price,
            })

        enriched.append({
            "id": order.id,
            "customer_id": order.customer_id,
            "customer_name": customer_name,
            "total_amount": order.total_amount,
            "order_date": order.order_date,
            "items": items,
        })

    return enriched, total


async def get_order_by_id(db: AsyncSession, order_id: int):
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        return None

    cust_result = await db.execute(
        select(Customer.name).where(Customer.id == order.customer_id)
    )
    customer_name = cust_result.scalar() or "Unknown"

    items_result = await db.execute(
        select(OrderItem, Product.name, Product.category)
        .join(Product, Product.id == OrderItem.product_id)
        .where(OrderItem.order_id == order.id)
    )
    items = []
    for item, prod_name, prod_cat in items_result.all():
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": prod_name,
            "product_category": prod_cat,
            "quantity": item.quantity,
            "price": item.price,
        })

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": customer_name,
        "total_amount": order.total_amount,
        "order_date": order.order_date,
        "items": items,
    }
