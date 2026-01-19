from pydantic import Field, field_validator

from app.core.normalization import normalize_tag_key

from .base import SchemaBase


class ArticleListQuery(SchemaBase):
    """記事一覧取得のクエリパラメーター。"""

    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=50)
    tags: list[str] = Field(default_factory=list)
    categories: list[str] = Field(default_factory=list)
    draft: bool | None = None  # 管理 API のみが利用するフラグ

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, v: list[str]):
        normalized: list[str] = []
        seen: set[str] = set()
        for raw in v:
            key = normalize_tag_key(raw)
            if not key or key in seen:
                continue
            seen.add(key)
            normalized.append(key)
        return normalized
