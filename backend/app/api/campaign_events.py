import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import get_db
from app.schemas.campaign import CampaignEventCreate
from app.models.campaign_event import CampaignEvent
from app.models.campaign import CampaignMessage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/campaign-events", tags=["Campaign Events"])


@router.post("")
async def receive_event(
    data: CampaignEventCreate,
    db: AsyncSession = Depends(get_db),
):
    """Webhook endpoint called by Channel Service to report delivery status."""
    event = CampaignEvent(
        campaign_id=data.campaign_id,
        customer_id=data.customer_id,
        message_id=data.message_id,
        status=data.status,
        timestamp=data.timestamp or datetime.now(timezone.utc),
    )
    db.add(event)

    # Update message status
    if data.message_id:
        result = await db.execute(
            select(CampaignMessage).where(CampaignMessage.id == data.message_id)
        )
        message = result.scalar_one_or_none()
        if message:
            message.status = data.status

    await db.flush()
    logger.info(f"Campaign event received: campaign={data.campaign_id}, status={data.status}")
    return {"status": "ok"}
