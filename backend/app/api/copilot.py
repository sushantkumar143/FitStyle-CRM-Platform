from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.user import User
from app.services.ai_service import copilot_chat

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])


class ChatRequest(BaseModel):
    message: str
    context: str = ""


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    user: User = Depends(get_current_user),
):
    response = copilot_chat(data.message, data.context)
    return {"response": response}
