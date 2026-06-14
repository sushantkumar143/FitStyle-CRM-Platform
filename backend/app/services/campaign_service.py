import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timezone
from app.models.campaign import Campaign, CampaignMessage
from app.models.campaign_event import CampaignEvent
from app.models.segment import Segment
from app.models.customer import Customer
from app.services.segment_service import get_segment_customer_ids
from app.services.channel_client import send_to_channel_service
from app.core.database import async_session_factory

logger = logging.getLogger(__name__)


async def create_campaign(
    db: AsyncSession,
    name: str,
    segment_id: int,
    channel: str,
    subject: str,
    generated_message: str,
    user_id: int,
) -> Campaign:
    # Get segment for audience size
    result = await db.execute(select(Segment).where(Segment.id == segment_id))
    segment = result.scalar_one_or_none()
    audience_size = segment.customer_count if segment else 0

    campaign = Campaign(
        name=name,
        segment_id=segment_id,
        channel=channel,
        status="DRAFT",
        subject=subject,
        generated_message=generated_message,
        audience_size=audience_size,
        created_by=user_id,
    )
    db.add(campaign)
    await db.flush()
    return campaign


async def send_campaign(campaign_id: int):
    """Background task to send campaign messages to channel service."""
    async with async_session_factory() as db:
        try:
            # Get campaign
            result = await db.execute(
                select(Campaign).where(Campaign.id == campaign_id)
            )
            campaign = result.scalar_one_or_none()
            if not campaign:
                logger.error(f"Campaign {campaign_id} not found")
                return

            # Update status
            campaign.status = "SENDING"
            await db.commit()

            # Get segment customers
            customer_ids = await get_segment_customer_ids(db, campaign.segment_id)
            if not customer_ids:
                logger.warning(f"No customers in segment for campaign {campaign_id}")
                campaign.status = "COMPLETED"
                await db.commit()
                return

            # Get customer details
            result = await db.execute(
                select(Customer).where(Customer.id.in_(customer_ids))
            )
            customers = result.scalars().all()

            # Create messages and send to channel service
            for customer in customers:
                # Personalize message
                message_text = campaign.generated_message or ""
                message_text = message_text.replace("{{name}}", customer.name)
                message_text = message_text.replace("{{favorite_category}}", "Footwear")

                # Create message record
                msg = CampaignMessage(
                    campaign_id=campaign.id,
                    customer_id=customer.id,
                    message=message_text,
                    status="SENT",
                    sent_at=datetime.now(timezone.utc),
                )
                db.add(msg)
                await db.flush()

                # Create SENT event
                event = CampaignEvent(
                    campaign_id=campaign.id,
                    customer_id=customer.id,
                    message_id=msg.id,
                    status="SENT",
                )
                db.add(event)
                await db.flush()

                # Send to channel service (fire and forget)
                recipient = customer.email if campaign.channel == "email" else customer.phone or customer.email
                await send_to_channel_service(
                    campaign_id=campaign.id,
                    message_id=msg.id,
                    customer_id=customer.id,
                    recipient=recipient,
                    channel=campaign.channel,
                    message=message_text,
                )

            # Update campaign status
            campaign.status = "SENT"
            campaign.audience_size = len(customers)
            await db.commit()
            logger.info(f"Campaign {campaign_id} sent to {len(customers)} customers")

        except Exception as e:
            logger.error(f"Error sending campaign {campaign_id}: {e}")
            try:
                result = await db.execute(
                    select(Campaign).where(Campaign.id == campaign_id)
                )
                campaign = result.scalar_one_or_none()
                if campaign:
                    campaign.status = "FAILED"
                    await db.commit()
            except Exception:
                pass


async def get_campaigns(db: AsyncSession):
    result = await db.execute(
        select(Campaign).order_by(desc(Campaign.created_at))
    )
    campaigns = result.scalars().all()

    enriched = []
    for c in campaigns:
        # Get segment name
        seg_result = await db.execute(
            select(Segment.name).where(Segment.id == c.segment_id)
        )
        segment_name = seg_result.scalar() or "Unknown"

        # Get stats
        stats = await get_campaign_stats(db, c.id)

        enriched.append({
            "id": c.id,
            "name": c.name,
            "segment_id": c.segment_id,
            "segment_name": segment_name,
            "channel": c.channel,
            "status": c.status,
            "subject": c.subject,
            "generated_message": c.generated_message,
            "audience_size": c.audience_size,
            "created_by": c.created_by,
            "created_at": c.created_at,
            "stats": stats,
        })

    return enriched


async def get_campaign_stats(db: AsyncSession, campaign_id: int) -> dict:
    statuses = ["SENT", "DELIVERED", "OPENED", "CLICKED", "CONVERTED", "FAILED"]
    stats = {}
    for status in statuses:
        result = await db.execute(
            select(func.count())
            .where(CampaignEvent.campaign_id == campaign_id)
            .where(CampaignEvent.status == status)
        )
        stats[status.lower()] = result.scalar() or 0
    return stats
