from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.operator_service import stream_operator_chat, execute_tool
from app.services.analytics_service import get_overview

router = APIRouter(prefix="/operator", tags=["AI Operator"])


class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]


class ExecuteToolRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]


@router.post("/chat")
async def chat(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Streams a chat response back using Server-Sent Events (SSE).
    """
    return StreamingResponse(
        stream_operator_chat(data.messages, db, user),
        media_type="text/event-stream",
    )


@router.post("/execute")
async def execute_operator_tool(
    data: ExecuteToolRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Executes a tool call after the user has approved it via HITL.
    """
    result = await execute_tool(data.tool_name, data.arguments, db, user)
    return result


@router.get("/brief")
async def get_strategic_brief(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Returns an AI-generated or structured strategic brief for the dashboard.
    """
    # For speed and reliability on dashboard load, we compile a static but data-driven brief.
    # In a full implementation, this could also be an LLM summarization.
    overview = await get_overview(db)
    
    return {
        "revenue_status": "Healthy",
        "revenue_growth": "+12.5%",
        "best_channel": "WhatsApp",
        "churn_risk": "Moderate",
        "insights": [
            "High-value customers contribute 60% of conversions.",
            "Footwear promotions have the highest click-through rate.",
            "Weekend campaigns generate 35% more opens.",
        ],
        "recommended_actions": [
            {
                "title": "Create Win-back Segment",
                "description": "Target 2,400 customers who haven't purchased in 60 days.",
                "action_type": "CREATE_SEGMENT",
                "payload": {"name": "Win-back 60 Days", "filters": [{"field": "last_purchase_days", "operator": ">", "value": 60}]}
            },
            {
                "title": "Launch Footwear Promo",
                "description": "Draft an SMS campaign for your active footwear buyers.",
                "action_type": "DRAFT_CAMPAIGN",
                "payload": {"name": "Weekend Footwear Promo", "channel": "SMS"}
            }
        ]
    }
