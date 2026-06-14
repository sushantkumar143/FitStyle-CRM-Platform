from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


def find_env_file() -> str:
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        env_path = parent / ".env"
        if env_path.exists():
            return str(env_path)
    return ".env"


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://fitstyle:fitstyle_secret@postgres:5432/fitstyle_crm"
    SYNC_DATABASE_URL: str = "postgresql://fitstyle:fitstyle_secret@postgres:5432/fitstyle_crm"

    # JWT
    JWT_SECRET: str = "fitstyle-crm-jwt-secret-key-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # AI
    AI_PROVIDER: str = "groq"
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Services
    CHANNEL_SERVICE_URL: str = "http://channel-service:8001"
    CRM_CALLBACK_URL: str = "http://backend:8000/api/campaign-events"

    class Config:
        env_file = find_env_file()
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
