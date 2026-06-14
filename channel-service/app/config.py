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
    CRM_CALLBACK_URL: str = "http://backend:8000/api/campaign-events"

    class Config:
        env_file = find_env_file()
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
