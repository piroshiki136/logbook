import re
from datetime import datetime

from pydantic import Field, field_validator

from app.core.slug import SLUG_VALIDATE_PATTERN

from .base import SchemaBase, TimestampMixin


class ArticleSummary(TimestampMixin):
    """一覧で返す「軽い」形。"""

    id: int
    slug: str
    title: str
    category: str
    tags: list[str] = Field(default_factory=list)
    published_at: datetime | None = None
    is_draft: bool


class ArticleDetail(ArticleSummary):
    """詳細で返す「重い」形。"""

    content: str


class ArticleCreate(SchemaBase):
    """作成（POST）用スキーマ。"""

    title: str
    slug: str | None = None
    content: str
    category: str
    tags: list[str] = Field(default_factory=list)
    is_draft: bool = False

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        """MVP では slug のざっくり制約のみを行う。"""

        if v is None:
            return None

        v = v.strip().lower()
        if not v:
            raise ValueError("slug は必須です")
        if " " in v:
            raise ValueError("slug に空白は使えません")
        if len(v) > 150:
            raise ValueError("slug は150文字以内で指定してください")
        if not re.fullmatch(
            SLUG_VALIDATE_PATTERN,
            v,
        ):
            raise ValueError(
                "slug は英小文字・数字・日本語・ハイフンのみ使用でき、先頭や連続ハイフンは不可です"
            )
        return v


class ArticlePatch(SchemaBase):
    """更新（PATCH）用スキーマ。全フィールド optional。"""

    title: str | None = None
    slug: str | None = None
    content: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_draft: bool | None = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        """slug のざっくり制約のみを行う。"""

        if v is None:
            return None

        v = v.strip().lower()
        if not v:
            raise ValueError("slug は必須です")
        if " " in v:
            raise ValueError("slug に空白は使えません")
        if len(v) > 150:
            raise ValueError("slug は150文字以内で指定してください")
        if not re.fullmatch(SLUG_VALIDATE_PATTERN, v):
            raise ValueError(
                "slug は英小文字・数字・日本語・ハイフンのみ使用でき、先頭や連続ハイフンは不可です"
            )
        return v


class ArticleListResponse(SchemaBase):
    """一覧レスポンス（ページング）。page/limit/total を仕様に合わせる。"""

    items: list[ArticleSummary]
    total: int
    page: int
    limit: int


class ArticleNeighbor(SchemaBase):
    """近接する記事情報。"""

    id: int
    slug: str
    title: str
    created_at: datetime
    published_at: datetime | None = None
    is_draft: bool


class ArticleNewerOlderResponse(SchemaBase):
    """新旧記事エンドポイントレスポンス。"""

    newer: ArticleNeighbor | None
    older: ArticleNeighbor | None
