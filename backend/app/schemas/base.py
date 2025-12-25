from datetime import datetime

from pydantic import BaseModel, ConfigDict


def to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


class SchemaBase(BaseModel):
    # - snake_case <-> camelCase を両立
    # - extra は基本 forbid（typo を即検知）
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,  # 入力時にsnake_caseでもcamelCaseでも受け付ける
        extra="forbid",  # 余分なフィールドを許可しない
    )


class TimestampMixin(SchemaBase):
    created_at: datetime
    updated_at: datetime
