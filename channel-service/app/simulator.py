import asyncio
import random
import logging
from app.config import get_settings
from app.callback import send_callback

logger = logging.getLogger(__name__)

# Realistic delivery probabilities per channel
CHANNEL_PROBABILITIES = {
    "whatsapp": {"delivered": 0.95, "opened": 0.72, "clicked": 0.28, "converted": 0.12},
    "email":    {"delivered": 0.88, "opened": 0.45, "clicked": 0.18, "converted": 0.08},
    "sms":      {"delivered": 0.92, "opened": 0.65, "clicked": 0.10, "converted": 0.05},
    "rcs":      {"delivered": 0.85, "opened": 0.55, "clicked": 0.22, "converted": 0.10},
}


async def simulate_delivery(
    campaign_id: int,
    message_id: int,
    customer_id: int,
    channel: str,
):
    """Simulate message delivery with realistic delays and probabilities."""
    probs = CHANNEL_PROBABILITIES.get(channel.lower(), CHANNEL_PROBABILITIES["email"])

    # Simulate network delay (1-5 seconds)
    await asyncio.sleep(random.uniform(1, 5))

    # Step 1: DELIVERED or FAILED
    if random.random() < probs["delivered"]:
        await send_callback(campaign_id, customer_id, message_id, "DELIVERED")

        # Step 2: OPENED (after short delay)
        await asyncio.sleep(random.uniform(1, 3))
        if random.random() < probs["opened"]:
            await send_callback(campaign_id, customer_id, message_id, "OPENED")

            # Step 3: CLICKED
            await asyncio.sleep(random.uniform(0.5, 2))
            if random.random() < probs["clicked"]:
                await send_callback(campaign_id, customer_id, message_id, "CLICKED")

                # Step 4: CONVERTED
                await asyncio.sleep(random.uniform(0.5, 1))
                if random.random() < probs["converted"]:
                    await send_callback(campaign_id, customer_id, message_id, "CONVERTED")
    else:
        await send_callback(campaign_id, customer_id, message_id, "FAILED")

    logger.info(f"Simulation complete: campaign={campaign_id}, customer={customer_id}, channel={channel}")
