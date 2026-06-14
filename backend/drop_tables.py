from app.core.database import Base
from app.core.config import get_settings
from sqlalchemy import create_engine
import os

from dotenv import load_dotenv
load_dotenv()

settings = get_settings()
# fallback if their DB url has "postgres" host but they run locally
db_url = settings.SYNC_DATABASE_URL
if "postgres:5432" in db_url:
    db_url = db_url.replace("postgres:5432", "localhost:5432")

engine = create_engine(db_url)

from app.models.campaign_event import CampaignEvent
from app.models.campaign import CampaignMessage, Campaign
from app.models.segment import Segment

print("Dropping tables...")
CampaignEvent.__table__.drop(engine, checkfirst=True)
CampaignMessage.__table__.drop(engine, checkfirst=True)
Campaign.__table__.drop(engine, checkfirst=True)
Segment.__table__.drop(engine, checkfirst=True)

print("Recreating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
