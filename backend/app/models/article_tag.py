from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ArticleTag(Base):
    """
    記事とタグを結ぶ N:N 中間テーブル。
    article_id と tag_id の複合主キーで同じタグの重複付与を防ぐ（docs/05）。
    """

    __tablename__ = "article_tags"
    __table_args__ = (UniqueConstraint("article_id", "tag_id"),)

    article_id: Mapped[int] = mapped_column(ForeignKey("articles.id"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), primary_key=True)
