import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.campaign import CampaignCreateRequest, CampaignGenerateRequest
from app.services.campaign_service import create_campaign, send_campaign, get_campaigns, get_campaign_stats
from app.services.ai_service import generate_campaign_content
from app.services.segment_service import get_segment_by_id

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.get("")
async def list_campaigns(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    campaigns = await get_campaigns(db)
    return {"campaigns": campaigns, "total": len(campaigns)}


@router.post("")
async def create(
    data: CampaignCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    campaign = await create_campaign(
        db, data.name, data.segment_id, data.channel,
        data.subject, data.generated_message, user.id,
    )
    return {
        "id": campaign.id,
        "name": campaign.name,
        "segment_id": campaign.segment_id,
        "channel": campaign.channel,
        "status": campaign.status,
        "subject": campaign.subject,
        "generated_message": campaign.generated_message,
        "audience_size": campaign.audience_size,
        "created_at": campaign.created_at,
    }


@router.post("/generate")
async def generate_content(
    data: CampaignGenerateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    segment = await get_segment_by_id(db, data.segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    content = generate_campaign_content(
        segment.name,
        segment.description or segment.name,
        data.channel,
        segment.customer_count,
    )
    return content


@router.post("/{campaign_id}/send")
async def send(
    campaign_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.campaign import Campaign

    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status not in ("DRAFT", "FAILED"):
        raise HTTPException(status_code=400, detail=f"Campaign already in status: {campaign.status}")

    background_tasks.add_task(send_campaign, campaign_id)
    return {"status": "sending", "message": "Campaign is being sent in the background"}


@router.get("/{campaign_id}")
async def get_campaign(
    campaign_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.campaign import Campaign
    from app.models.segment import Segment

    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    seg_result = await db.execute(select(Segment.name).where(Segment.id == campaign.segment_id))
    segment_name = seg_result.scalar() or "Unknown"

    stats = await get_campaign_stats(db, campaign_id)

    return {
        "id": campaign.id,
        "name": campaign.name,
        "segment_id": campaign.segment_id,
        "segment_name": segment_name,
        "channel": campaign.channel,
        "status": campaign.status,
        "subject": campaign.subject,
        "generated_message": campaign.generated_message,
        "audience_size": campaign.audience_size,
        "created_by": campaign.created_by,
        "created_at": campaign.created_at,
        "stats": stats,
    }
