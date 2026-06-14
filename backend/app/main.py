import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, customers, products, orders, segments, campaigns, campaign_events, analytics, copilot, operator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: seed database if empty."""
    logger.info("Starting FitStyle CRM Backend...")
    try:
        from app.seed.seed_data import seed_database
        seed_database()
    except Exception as e:
        logger.error(f"Seeding error: {e}")
    yield
    logger.info("Shutting down FitStyle CRM Backend...")


app = FastAPI(
    title="FitStyle CRM API",
    description="AI-Native Mini CRM for FitStyle Fashion Brand",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(segments.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(campaign_events.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(operator.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "fitstyle-crm"}
