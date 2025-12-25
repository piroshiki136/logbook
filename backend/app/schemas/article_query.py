from pydantic import Field, field_validator

from .base import SchemaBase


class ArticleListQuery(SchemaBase):
    """記事一覧取得のクエリパラメーター。"""

    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=50)
    tags: list[str] = Field(default_factory=list)
    categories: list[str] = Field(default_factory=list)
    draft: bool | None = None  # 管理 API のみが利用するフラグ

    @field_validator("tags", "categories", mode="before")
    @classmethod
    def split_csv(cls, v):
        """カンマ区切り文字列をリストへ変換する。"""

        if v is None:
            return []
        if isinstance(v, list):
            return v
        s = str(v).strip()
        if not s:
            return []
        return [x.strip() for x in s.split(",") if x.strip()]
