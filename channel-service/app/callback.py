import httpx
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_callback(
    campaign_id: int,
    customer_id: int,
    message_id: int,
    status: str,
):
    """Send delivery status callback to CRM backend."""
    settings = get_settings()
    payload = {
        "campaign_id": campaign_id,
        "customer_id": customer_id,
        "message_id": message_id,
        "status": status,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(settings.CRM_CALLBACK_URL, json=payload)
            if response.status_code == 200:
                logger.info(f"Callback sent: campaign={campaign_id}, status={status}")
            else:
                logger.error(f"Callback failed: {response.status_code}")
    except Exception as e:
        logger.error(f"Callback error: {e}")
