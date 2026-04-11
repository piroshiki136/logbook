from pydantic import field_validator

from .base import SchemaBase


class TagRead(SchemaBase):
    id: int
    name: str
    slug: str


class TagUpdate(SchemaBase):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name は必須です")
        if len(v) > 100:
            raise ValueError("name は100文字以内で指定してください")
        return v
