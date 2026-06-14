from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, desc
from datetime import datetime, timezone, timedelta
from app.models.customer import Customer
from app.models.order import Order
from app.models.campaign import Campaign
from app.models.campaign_event import CampaignEvent


async def get_overview(db: AsyncSession) -> dict:
    # Total customers
    result = await db.execute(select(func.count(Customer.id)))
    total_customers = result.scalar() or 0

    # Total orders
    result = await db.execute(select(func.count(Order.id)))
    total_orders = result.scalar() or 0

    # Total revenue
    result = await db.execute(select(func.coalesce(func.sum(Order.total_amount), 0)))
    total_revenue = result.scalar() or 0

    # Active campaigns
    result = await db.execute(
        select(func.count()).where(Campaign.status.in_(["SENDING", "SENT"]))
    )
    active_campaigns = result.scalar() or 0

    # Total campaigns
    result = await db.execute(select(func.count(Campaign.id)))
    total_campaigns = result.scalar() or 0

    # Revenue by month (last 12 months)
    revenue_by_month = []
    now = datetime.now(timezone.utc)
    for i in range(11, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if i > 0:
            month_end = (now.replace(day=1) - timedelta(days=(i - 1) * 30)).replace(day=1)
        else:
            month_end = now

        result = await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .where(Order.order_date >= month_start)
            .where(Order.order_date < month_end)
        )
        monthly_revenue = result.scalar() or 0

        revenue_by_month.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": round(monthly_revenue, 2),
        })

    return {
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "active_campaigns": active_campaigns,
        "total_campaigns": total_campaigns,
        "revenue_by_month": revenue_by_month,
    }


async def get_campaign_funnel(db: AsyncSession) -> dict:
    statuses = ["SENT", "DELIVERED", "OPENED", "CLICKED", "CONVERTED", "FAILED"]
    funnel = {}
    for status in statuses:
        result = await db.execute(
            select(func.count()).where(CampaignEvent.status == status)
        )
        funnel[status.lower()] = result.scalar() or 0

    sent = funnel.get("sent", 0) or 1  # Avoid division by zero
    delivered = funnel.get("delivered", 0)
    opened = funnel.get("opened", 0)
    clicked = funnel.get("clicked", 0)
    converted = funnel.get("converted", 0)

    rates = {
        "delivery_rate": round((delivered / sent) * 100, 1) if sent else 0,
        "open_rate": round((opened / delivered) * 100, 1) if delivered else 0,
        "click_rate": round((clicked / opened) * 100, 1) if opened else 0,
        "conversion_rate": round((converted / clicked) * 100, 1) if clicked else 0,
    }

    return {"funnel": funnel, "rates": rates}


async def get_channel_performance(db: AsyncSession) -> list:
    channels = ["whatsapp", "email", "sms", "rcs"]
    performance = []

    for channel in channels:
        # Get campaign IDs for this channel
        campaign_result = await db.execute(
            select(Campaign.id).where(Campaign.channel == channel)
        )
        campaign_ids = [row[0] for row in campaign_result.all()]

        if not campaign_ids:
            performance.append({
                "channel": channel,
                "sent": 0, "delivered": 0, "opened": 0,
                "clicked": 0, "converted": 0,
                "delivery_rate": 0, "open_rate": 0,
            })
            continue

        stats = {}
        for status in ["SENT", "DELIVERED", "OPENED", "CLICKED", "CONVERTED"]:
            result = await db.execute(
                select(func.count())
                .where(CampaignEvent.campaign_id.in_(campaign_ids))
                .where(CampaignEvent.status == status)
            )
            stats[status.lower()] = result.scalar() or 0

        sent = stats.get("sent", 0) or 1
        delivered = stats.get("delivered", 0)

        performance.append({
            "channel": channel,
            **stats,
            "delivery_rate": round((delivered / sent) * 100, 1),
            "open_rate": round((stats.get("opened", 0) / max(delivered, 1)) * 100, 1),
        })

    return performance


async def get_top_campaigns(db: AsyncSession) -> list:
    result = await db.execute(
        select(Campaign).order_by(desc(Campaign.created_at)).limit(10)
    )
    campaigns = result.scalars().all()

    top = []
    for c in campaigns:
        # Count events
        events_result = await db.execute(
            select(CampaignEvent.status, func.count())
            .where(CampaignEvent.campaign_id == c.id)
            .group_by(CampaignEvent.status)
        )
        event_counts = {row[0]: row[1] for row in events_result.all()}

        top.append({
            "id": c.id,
            "name": c.name,
            "channel": c.channel,
            "audience_size": c.audience_size,
            "delivered": event_counts.get("DELIVERED", 0),
            "opened": event_counts.get("OPENED", 0),
            "clicked": event_counts.get("CLICKED", 0),
            "converted": event_counts.get("CONVERTED", 0),
        })

    return top


async def get_segment_performance(db: AsyncSession) -> list:
    from app.models.segment import Segment

    result = await db.execute(select(Segment))
    segments = result.scalars().all()

    perf = []
    for seg in segments:
        # Get campaigns for this segment
        camp_result = await db.execute(
            select(Campaign.id).where(Campaign.segment_id == seg.id)
        )
        campaign_ids = [row[0] for row in camp_result.all()]

        total_sent = 0
        total_converted = 0
        if campaign_ids:
            sent_result = await db.execute(
                select(func.count())
                .where(CampaignEvent.campaign_id.in_(campaign_ids))
                .where(CampaignEvent.status == "SENT")
            )
            total_sent = sent_result.scalar() or 0

            conv_result = await db.execute(
                select(func.count())
                .where(CampaignEvent.campaign_id.in_(campaign_ids))
                .where(CampaignEvent.status == "CONVERTED")
            )
            total_converted = conv_result.scalar() or 0

        perf.append({
            "segment": seg.name,
            "audience_size": seg.customer_count,
            "campaigns": len(campaign_ids),
            "total_sent": total_sent,
            "conversions": total_converted,
            "conversion_rate": round((total_converted / max(total_sent, 1)) * 100, 1),
        })

    return perf
