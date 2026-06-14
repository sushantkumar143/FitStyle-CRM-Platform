from pydantic import BaseModel
from typing import Optional


class SendRequest(BaseModel):
    campaign_id: int
    message_id: int
    customer_id: int
    recipient: str
    channel: str
    message: str


class CallbackPayload(BaseModel):
    campaign_id: int
    customer_id: int
    message_id: Optional[int] = None
    status: str
