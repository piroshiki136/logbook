import re

from pydantic import field_validator

from app.core.slug import SLUG_VALIDATE_PATTERN

from .base import SchemaBase


class CategoryRead(SchemaBase):
    id: int
    name: str
    slug: str
    color: str | None = None
    icon: str | None = None


class CategoryCreate(SchemaBase):
    name: str
    slug: str | None = None
    color: str | None = None
    icon: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name は必須です")
        if len(v) > 100:
            raise ValueError("name は100文字以内で指定してください")
        return v

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is None:
            return None

        v = v.strip().lower()
        if not v:
            raise ValueError("slug は必須です")
        if len(v) > 100:
            raise ValueError("slug は100文字以内で指定してください")
        if not re.fullmatch(
            SLUG_VALIDATE_PATTERN,
            v,
        ):
            raise ValueError(
                "slug は英小文字・数字・日本語・ハイフンのみ使用でき、先頭や連続ハイフンは不可です"
            )
        return v

    @field_validator("color", "icon")
    @classmethod
    def validate_optional_short_text(cls, v: str | None) -> str | None:
        if v is None:
            return None

        v = v.strip()
        if not v:
            return None
        if len(v) > 50:
            raise ValueError("color と icon は50文字以内で指定してください")
        return v
