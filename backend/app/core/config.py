from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Quest by NIAT API"
    app_env: str = "development"
    database_url: str = "postgresql+asyncpg://aiquest:aiquest@localhost:5432/aiquest"
    jwt_secret: str = Field(min_length=32)
    jwt_expires_minutes: int = 60
    allowed_origins: str = "http://localhost:5173"
    public_app_url: str = "http://localhost:5173"
    social_reward_xp: int = 50
    referral_reward_xp: int = 100
    workshop_attendance_xp: int = 100
    quiz_completion_xp: int = 75
    project_submission_xp: int = 100
    quest_completion_xp: int = 50
    workshop_meeting_url: str | None = None
    workshop_title: str = "Build Your First AI Project in 60 Minutes"
    workshop_check_in_secret: str | None = None
    email_provider: str = "none"
    email_from: str | None = None
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    email_verification_url: str | None = None
    password_reset_url: str | None = None
    admin_api_key: str = "prototype-admin-key"
    rate_limit_per_minute: int = 30
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def verification_url(self) -> str:
        return self.email_verification_url or f"{self.public_app_url.rstrip('/')}/verify-email"

    @property
    def reset_url(self) -> str:
        return self.password_reset_url or f"{self.public_app_url.rstrip('/')}/reset-password"


def async_database_url(url: str) -> str:
    """Render supplies postgresql://; SQLAlchemy async needs the asyncpg dialect."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
