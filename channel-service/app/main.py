import logging
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import SendRequest
from app.simulator import simulate_delivery

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FitStyle Channel Service",
    description="Message delivery simulation microservice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fitstyle-channel-service"}


@app.post("/send", status_code=202)
async def send_message(data: SendRequest, background_tasks: BackgroundTasks):
    """Accept a message for delivery simulation."""
    logger.info(f"Received message: campaign={data.campaign_id}, channel={data.channel}, customer={data.customer_id}")

    background_tasks.add_task(
        simulate_delivery,
        data.campaign_id,
        data.message_id,
        data.customer_id,
        data.channel,
    )

    return {"status": "accepted", "message": "Message queued for delivery simulation"}
