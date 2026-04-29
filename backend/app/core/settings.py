import json
import os
from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _env_file() -> str:
    """
    SETTINGS_ENV=test なら .env.test
    それ以外は .env.local があればそれ、なければ .env
    """
    env = os.getenv("SETTINGS_ENV", "local").lower()

    if env == "test":
        return ".env.test"

    if os.path.exists(".env.local"):
        return ".env.local"

    return ".env"


class Settings(BaseSettings):
    # extra="ignore" は「.env に余計な変数があっても落とさない」ための保険
    model_config = SettingsConfigDict(
        env_file=_env_file(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ---- App ----
    app_name: str = "LogBook"
    env: Literal["local", "dev", "stg", "prod"] = Field(
        default="local",
        validation_alias="APP_MODE",
    )
    api_v1_prefix: str = "/api"

    @computed_field
    @property
    def debug(self) -> bool:
        return self.env in ("local", "dev")

    # ---- CORS ----
    # 例: CORS_ALLOW_ORIGINS='["http://localhost:3000"]'
    cors_allow_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        validation_alias="CORS_ALLOW_ORIGINS",
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
    jwt_public_key: str = Field(..., validation_alias="JWT_PUBLIC_KEY")
    jwt_private_key: str | None = Field(None, validation_alias="JWT_PRIVATE_KEY")
    jwt_issuer: str = Field("logbook", validation_alias="JWT_ISSUER")
    jwt_audience: str = Field("logbook", validation_alias="JWT_AUDIENCE")
    jwt_algorithm: str = Field("RS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = 60
    admin_allowed_emails_raw: str = Field(
        ...,
        validation_alias="ADMIN_ALLOWED_EMAILS",
    )
    frontend_assertion_public_key: str | None = Field(
        None, validation_alias="FRONTEND_ASSERTION_PUBLIC_KEY"
    )
    frontend_assertion_jwks_url: str | None = Field(
        None, validation_alias="FRONTEND_ASSERTION_JWKS_URL"
    )
    frontend_assertion_issuer: str = Field(
        "logbook-frontend", validation_alias="FRONTEND_ASSERTION_ISSUER"
    )

    @computed_field
    @property
    def admin_allowed_emails(self) -> list[str]:
        """
        ADMIN_ALLOWED_EMAILS を
        "a@example.com,b@example.com"
        → ["a@example.com", "b@example.com"]
        に変換する
        """
        return [
            email.strip().lower()
            for email in self.admin_allowed_emails_raw.split(",")
            if email.strip()
        ]

    @field_validator("jwt_public_key", mode="before")
    @classmethod
    def normalize_public_key(cls, value: str | None):
        if not value:
            raise ValueError("JWT_PUBLIC_KEY is required")
        return value.replace("\\n", "\n").strip()

    @field_validator("jwt_private_key", mode="before")
    @classmethod
    def normalize_private_key(cls, value: str | None):
        if not value:
            return None
        return value.replace("\\n", "\n").strip()

    @field_validator("frontend_assertion_public_key", mode="before")
    @classmethod
    def normalize_frontend_assertion_public_key(cls, value: str | None):
        if not value:
            return None
        return value.replace("\\n", "\n").strip()

    upload_root: str = Field("uploads", validation_alias="UPLOAD_ROOT")
    asset_base_url: str = Field("http://localhost:8000/uploads", validation_alias="ASSET_BASE_URL")
    upload_image_max_bytes: int = Field(
        5 * 1024 * 1024,
        validation_alias="UPLOAD_IMAGE_MAX_BYTES",
    )

    # ---- Logging ----
    @computed_field
    @property
    def log_level(self) -> Literal["DEBUG", "INFO"]:
        return "DEBUG" if self.debug else "INFO"


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    env = os.getenv("SETTINGS_ENV", "local").lower()

    if env == "test" and s.database_url.startswith("postgres"):
        raise RuntimeError(
            "SETTINGS_ENV=test のときに PostgreSQL に接続しようとしています（事故防止）"
        )

    return s


settings = get_settings()
