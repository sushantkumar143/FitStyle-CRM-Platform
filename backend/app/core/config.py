from pydantic import model_validator
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

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000"

    # JWT
    JWT_SECRET: str = "fitstyle-crm-jwt-secret-key-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # AI
    AI_PROVIDER: str = "groq"
    GROQ_API_KEY: str = ""
    GROQ_API_KEY_1: str = ""
    GROQ_API_KEY_2: str = ""
    GROQ_API_KEY_3: str = ""
    OPENAI_API_KEY: str = ""

    # Ollama Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_MODEL: str = "llama3"

    # Services
    CHANNEL_SERVICE_URL: str = "http://channel-service:8001"
    CRM_CALLBACK_URL: str = "http://backend:8000/api/campaign-events"

    @model_validator(mode="before")
    @classmethod
    def adjust_database_urls(cls, data: any) -> any:
        if isinstance(data, dict):
            import os
            db_url = data.get("DATABASE_URL") or os.getenv("DATABASE_URL")
            if db_url:
                # Render PostgreSQL provides postgres://, which is not supported by SQLAlchemy directly.
                # Standardize to postgresql://
                base_url = db_url
                if base_url.startswith("postgres://"):
                    base_url = base_url.replace("postgres://", "postgresql://", 1)
                
                # Derive Sync Database URL
                sync_url = base_url
                if "+asyncpg" in sync_url:
                    sync_url = sync_url.replace("+asyncpg", "")
                data["SYNC_DATABASE_URL"] = sync_url
                
                # Derive Async Database URL (inject +asyncpg)
                async_url = base_url
                if "postgresql://" in async_url and "+asyncpg" not in async_url:
                    async_url = async_url.replace("postgresql://", "postgresql+asyncpg://", 1)
                data["DATABASE_URL"] = async_url
        return data

    class Config:
        env_file = find_env_file()
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

