from datetime import datetime

from pydantic import Field, field_validator

from .base import SchemaBase, TimestampMixin


class ArticleSummary(TimestampMixin):
    """一覧で返す「軽い」形。"""

    id: int
    slug: str
    title: str
    category: str
    tags: list[str] = Field(default_factory=list)
    is_draft: bool


class ArticleDetail(ArticleSummary):
    """詳細で返す「重い」形。"""

    content: str


class ArticleCreate(SchemaBase):
    """作成（POST）用スキーマ。"""

    title: str
    slug: str
    content: str
    category: str
    tags: list[str] = Field(default_factory=list)
    is_draft: bool = False

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """MVP では slug のざっくり制約のみを行う。"""

        v = v.strip()
        if not v:
            raise ValueError("slug は必須です")
        if " " in v:
            raise ValueError("slug に空白は使えません")
        return v


class ArticlePatch(SchemaBase):
    """更新（PATCH）用スキーマ。全フィールド optional。"""

    title: str | None = None
    slug: str | None = None
    content: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_draft: bool | None = None


class ArticleListResponse(SchemaBase):
    """一覧レスポンス（ページング）。page/limit/total を仕様に合わせる。"""

    items: list[ArticleSummary]
    total: int
    page: int
    limit: int


class ArticleNeighbor(SchemaBase):
    """前後の記事情報。"""

    id: int
    slug: str
    title: str
    created_at: datetime
    is_draft: bool


class ArticlePrevNextResponse(SchemaBase):
    """前後の記事エンドポイントレスポンス。"""

    prev: ArticleNeighbor | None
    next: ArticleNeighbor | None
