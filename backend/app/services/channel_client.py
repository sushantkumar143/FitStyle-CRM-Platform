import httpx
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_to_channel_service(
    campaign_id: int,
    message_id: int,
    customer_id: int,
    recipient: str,
    channel: str,
    message: str,
):
    """Send a message to the Channel Service for delivery simulation."""
    payload = {
        "campaign_id": campaign_id,
        "message_id": message_id,
        "customer_id": customer_id,
        "recipient": recipient,
        "channel": channel,
        "message": message,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.CHANNEL_SERVICE_URL}/send",
                json=payload,
            )
            if response.status_code == 202:
                logger.info(f"Message sent to channel service: campaign={campaign_id}, customer={customer_id}")
            else:
                logger.error(f"Channel service error: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Failed to send to channel service: {e}")
