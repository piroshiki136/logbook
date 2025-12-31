import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.article import Article

_SLUG_CLEAN_RE = re.compile(r"[^0-9a-zぁ-んァ-ン一-龯ー々ヶゝゞ]+")


def slugify(value: str) -> str:
    normalized = value.strip().lower()
    slug = _SLUG_CLEAN_RE.sub("-", normalized)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug


def ensure_unique_slug(session: Session, base_slug: str) -> str:
    slug = base_slug
    suffix = 2

    while _slug_exists(session, slug):
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    return slug


def _slug_exists(session: Session, slug: str) -> bool:
    stmt = select(Article.id).where(Article.slug == slug).limit(1)
    return session.execute(stmt).first() is not None
