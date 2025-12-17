import json
from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # extra="ignore" は「.env に余計な変数があっても落とさない」ための保険
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ---- App ----
    app_name: str = "LogBook"
    env: Literal["local", "dev", "stg", "prod"] = "local"
    api_v1_prefix: str = "/api"

    @computed_field
    @property
    def debug(self) -> bool:
        return self.env in ("local", "dev")

    # ---- CORS ----
    # 例: CORS_ALLOW_ORIGINS='["http://localhost:3000"]'
    cors_allow_origins: list[str] = Field(
        default_factory=list, validation_alias="CORS_ALLOW_ORIGINS"
    )

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]):
        """JSON 文字列やカンマ区切りを list[str] に変換する。"""
        if isinstance(value, list):
            return value
        if not value:
            return []
        value = value.strip()
        if value.startswith("["):
            return json.loads(value)
        return [origin.strip() for origin in value.split(",") if origin.strip()]

    # ---- Database ----
    database_url: str = Field(..., validation_alias="DATABASE_URL")

    # ---- Security / Auth ----
    nextauth_secret: str = Field(..., validation_alias="NEXTAUTH_SECRET")
    jwt_issuer: str = Field("logbook", validation_alias="JWT_ISSUER")
    jwt_audience: str = Field("logbook", validation_alias="JWT_AUDIENCE")
    access_token_expire_minutes: int = 60
    admin_allowed_emails: list[str] = Field(
        default_factory=list, validation_alias="ADMIN_ALLOWED_EMAILS"
    )

    @field_validator("admin_allowed_emails", mode="before")
    @classmethod
    def split_admin_emails(cls, value: str | list[str]):
        if isinstance(value, list):
            return [email.strip() for email in value if email.strip()]
        if not value:
            return []
        return [email.strip() for email in value.split(",") if email.strip()]

    asset_base_url: str = Field("http://localhost:8000/uploads", validation_alias="ASSET_BASE_URL")

    # ---- Logging ----
    @computed_field
    @property
    def log_level(self) -> Literal["DEBUG", "INFO"]:
        return "DEBUG" if self.debug else "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
