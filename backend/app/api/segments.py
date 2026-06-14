from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.segment import SegmentCreateRequest, SegmentPreviewRequest, AISegmentRequest, SegmentFilter
from app.services.segment_service import (
    preview_segment, create_segment, get_segments, get_segment_by_id
)
from app.services.ai_service import parse_natural_language_segment, suggest_segment_ideas

router = APIRouter(prefix="/segments", tags=["Segments"])


@router.get("")
async def list_segments(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    segments = await get_segments(db)
    return {
        "segments": [
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "filters": s.filters,
                "customer_count": s.customer_count,
                "created_by": s.created_by,
                "created_at": s.created_at,
                "limit": s.limit,
                "sort_by": s.sort_by,
            }
            for s in segments
        ],
        "total": len(segments),
    }


@router.post("/preview")
async def preview(
    data: SegmentPreviewRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count, sample = await preview_segment(db, data.filters, data.limit, data.sort_by)
    return {
        "customer_count": count,
        "filters": [f.model_dump() for f in data.filters],
        "sample_customers": sample,
        "limit": data.limit,
        "sort_by": data.sort_by,
    }


@router.post("")
async def create(
    data: SegmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    segment = await create_segment(
        db, data.name, data.description or "", data.filters, user.id, data.limit, data.sort_by
    )
    return {
        "id": segment.id,
        "name": segment.name,
        "description": segment.description,
        "filters": segment.filters,
        "customer_count": segment.customer_count,
        "created_by": segment.created_by,
        "created_at": segment.created_at,
        "limit": segment.limit,
        "sort_by": segment.sort_by,
    }


@router.post("/ai-build")
async def ai_build(
    data: AISegmentRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    parsed = parse_natural_language_segment(data.query)
    filters = [SegmentFilter(**f) for f in parsed.get("filters", [])]
    limit = parsed.get("limit")
    sort_by = parsed.get("sort_by")
    count, sample = await preview_segment(db, filters, limit, sort_by)
    return {
        "query": data.query,
        "filters": [f.model_dump() for f in filters],
        "limit": limit,
        "sort_by": sort_by,
        "customer_count": count,
        "sample_customers": sample,
    }


@router.post("/ai-suggest")
async def ai_suggest(
    data: AISegmentRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    suggestions = suggest_segment_ideas(data.query)
    return {"suggestions": suggestions}


@router.get("/{segment_id}")
async def get_segment(
    segment_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    segment = await get_segment_by_id(db, segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    return {
        "id": segment.id,
        "name": segment.name,
        "description": segment.description,
        "filters": segment.filters,
        "customer_count": segment.customer_count,
        "created_by": segment.created_by,
        "created_at": segment.created_at,
        "limit": segment.limit,
        "sort_by": segment.sort_by,
    }
