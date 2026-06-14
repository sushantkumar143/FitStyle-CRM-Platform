from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.analytics_service import (
    get_overview, get_campaign_funnel, get_channel_performance,
    get_top_campaigns, get_segment_performance,
)
from app.services.ai_service import generate_insights

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def overview(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_overview(db)


@router.get("/funnel")
async def funnel(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_campaign_funnel(db)


@router.get("/channels")
async def channels(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_channel_performance(db)


@router.get("/top-campaigns")
async def top_campaigns(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_top_campaigns(db)


@router.get("/segment-performance")
async def segment_performance(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await get_segment_performance(db)


@router.get("/insights")
async def insights(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    funnel_data = await get_campaign_funnel(db)
    channel_data = await get_channel_performance(db)
    overview_data = await get_overview(db)

    analytics_data = {
        "funnel": funnel_data,
        "channels": channel_data,
        "overview": overview_data,
    }

    ai_insights = generate_insights(analytics_data)
    return {"insights": ai_insights}
