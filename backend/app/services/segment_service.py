from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, desc, and_
from datetime import datetime, timedelta, timezone
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.segment import Segment
from app.schemas.segment import SegmentFilter
from typing import List


async def apply_filters(db: AsyncSession, filters: List[SegmentFilter]):
    """Build a query from segment filters and return matching customer IDs."""
    customer_ids = None

    for f in filters:
        field = f.field
        operator = f.operator
        value = f.value

        if field == "total_spend":
            subq = (
                select(Order.customer_id)
                .group_by(Order.customer_id)
                .having(_apply_operator(func.sum(Order.total_amount), operator, float(value)))
            )
            result = await db.execute(subq)
            ids = {row[0] for row in result.all()}

        elif field == "order_count":
            subq = (
                select(Order.customer_id)
                .group_by(Order.customer_id)
                .having(_apply_operator(func.count(Order.id), operator, int(value)))
            )
            result = await db.execute(subq)
            ids = {row[0] for row in result.all()}

        elif field == "last_purchase_days":
            cutoff = datetime.now(timezone.utc) - timedelta(days=int(value))
            if operator in (">", ">="):
                # No order in X days = last purchase was before cutoff
                subq = (
                    select(Order.customer_id)
                    .group_by(Order.customer_id)
                    .having(func.max(Order.order_date) < cutoff)
                )
            else:
                subq = (
                    select(Order.customer_id)
                    .group_by(Order.customer_id)
                    .having(func.max(Order.order_date) >= cutoff)
                )
            result = await db.execute(subq)
            ids = {row[0] for row in result.all()}

        elif field == "product_category":
            if operator == "not_in":
                # Customers who never purchased from this category
                categories = value if isinstance(value, list) else [value]
                bought_subq = (
                    select(distinct(Order.customer_id))
                    .join(OrderItem, OrderItem.order_id == Order.id)
                    .join(Product, Product.id == OrderItem.product_id)
                    .where(Product.category.in_(categories))
                )
                bought_result = await db.execute(bought_subq)
                bought_ids = {row[0] for row in bought_result.all()}

                all_result = await db.execute(select(Customer.id))
                all_ids = {row[0] for row in all_result.all()}
                ids = all_ids - bought_ids
            else:
                categories = value if isinstance(value, list) else [value]
                subq = (
                    select(distinct(Order.customer_id))
                    .join(OrderItem, OrderItem.order_id == Order.id)
                    .join(Product, Product.id == OrderItem.product_id)
                    .where(Product.category.in_(categories))
                )
                result = await db.execute(subq)
                ids = {row[0] for row in result.all()}

        elif field == "product_name":
            if operator == "not_in":
                products = value if isinstance(value, list) else [value]
                bought_subq = (
                    select(distinct(Order.customer_id))
                    .join(OrderItem, OrderItem.order_id == Order.id)
                    .join(Product, Product.id == OrderItem.product_id)
                    .where(Product.name.in_(products))
                )
                bought_result = await db.execute(bought_subq)
                bought_ids = {row[0] for row in bought_result.all()}

                all_result = await db.execute(select(Customer.id))
                all_ids = {row[0] for row in all_result.all()}
                ids = all_ids - bought_ids
            else:
                products = value if isinstance(value, list) else [value]
                subq = (
                    select(distinct(Order.customer_id))
                    .join(OrderItem, OrderItem.order_id == Order.id)
                    .join(Product, Product.id == OrderItem.product_id)
                    .where(Product.name.in_(products))
                )
                result = await db.execute(subq)
                ids = {row[0] for row in result.all()}

        elif field == "city":
            cities = value if isinstance(value, list) else [value]
            subq = select(Customer.id).where(Customer.city.in_(cities))
            result = await db.execute(subq)
            ids = {row[0] for row in result.all()}

        else:
            continue

        # Intersect with previous filters (AND logic)
        if customer_ids is None:
            customer_ids = ids
        else:
            customer_ids = customer_ids & ids

    return customer_ids or set()


def _apply_operator(column, operator: str, value):
    if operator == ">":
        return column > value
    elif operator == ">=":
        return column >= value
    elif operator == "<":
        return column < value
    elif operator == "<=":
        return column <= value
    elif operator == "==" or operator == "=":
        return column == value
    elif operator == "!=":
        return column != value
    else:
        return column > value


async def _apply_limit_and_sort(db: AsyncSession, customer_ids: set, limit: int = None, sort_by: str = None) -> list:
    if not customer_ids:
        return []

    if not sort_by:
        res = list(customer_ids)
        if limit is not None:
            res = res[:limit]
        return res

    if sort_by == "total_spend":
        query = (
            select(Customer.id)
            .join(Order, Order.customer_id == Customer.id)
            .where(Customer.id.in_(customer_ids))
            .group_by(Customer.id)
            .order_by(desc(func.sum(Order.total_amount)))
        )
    elif sort_by == "order_count":
        query = (
            select(Customer.id)
            .join(Order, Order.customer_id == Customer.id)
            .where(Customer.id.in_(customer_ids))
            .group_by(Customer.id)
            .order_by(desc(func.count(Order.id)))
        )
    else:
        res = list(customer_ids)
        if limit is not None:
            res = res[:limit]
        return res

    if limit is not None:
        query = query.limit(limit)

    result = await db.execute(query)
    return [row[0] for row in result.all()]


async def preview_segment(db: AsyncSession, filters: List[SegmentFilter], limit: int = None, sort_by: str = None):
    customer_ids = await apply_filters(db, filters)
    
    sorted_ids = await _apply_limit_and_sort(db, customer_ids, limit, sort_by)
    count = len(sorted_ids) if (limit is not None or sort_by) else len(customer_ids)

    sample = []
    if sorted_ids:
        sample_ids = sorted_ids[:10]
        result = await db.execute(
            select(Customer).where(Customer.id.in_(sample_ids))
        )
        customers_by_id = {c.id: c for c in result.scalars().all()}
        sample = [
            {"id": c.id, "name": c.name, "email": c.email, "city": c.city}
            for c in [customers_by_id.get(sid) for sid in sample_ids] if c
        ]

    return count, sample


async def create_segment(
    db: AsyncSession,
    name: str,
    description: str,
    filters: List[SegmentFilter],
    user_id: int,
    limit: int = None,
    sort_by: str = None,
):
    customer_ids = await apply_filters(db, filters)
    sorted_ids = await _apply_limit_and_sort(db, customer_ids, limit, sort_by)
    segment = Segment(
        name=name,
        description=description,
        filters=[f.model_dump() for f in filters],
        limit=limit,
        sort_by=sort_by,
        customer_count=len(sorted_ids) if (limit is not None or sort_by) else len(customer_ids),
        created_by=user_id,
    )
    db.add(segment)
    await db.flush()
    return segment


async def get_segments(db: AsyncSession):
    result = await db.execute(
        select(Segment).order_by(desc(Segment.created_at))
    )
    return result.scalars().all()


async def get_segment_by_id(db: AsyncSession, segment_id: int):
    result = await db.execute(
        select(Segment).where(Segment.id == segment_id)
    )
    return result.scalar_one_or_none()


async def get_segment_customer_ids(db: AsyncSession, segment_id: int) -> set:
    segment = await get_segment_by_id(db, segment_id)
    if not segment:
        return set()

    filters = [SegmentFilter(**f) for f in segment.filters]
    customer_ids = await apply_filters(db, filters)
    if getattr(segment, "limit", None) is not None or getattr(segment, "sort_by", None):
        sorted_ids = await _apply_limit_and_sort(db, customer_ids, getattr(segment, "limit", None), getattr(segment, "sort_by", None))
        return set(sorted_ids)
    return customer_ids
