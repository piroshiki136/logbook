# tags モデルの挿入とユニーク制約を確認するテスト
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import Tag


def test_tag_insert_and_unique_name(db_session):
    tag = Tag(name="fastapi", slug="fastapi")
    db_session.add(tag)
    db_session.flush()

    saved = db_session.execute(select(Tag).where(Tag.name == "fastapi")).scalar_one()
    assert saved.slug == "fastapi"

    duplicate = Tag(name="fastapi", slug="fastapi-dup")
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_tag_unique_slug(db_session):
    tag = Tag(name="fastapi", slug="fastapi")
    db_session.add(tag)
    db_session.flush()

    duplicate_slug = Tag(name="fastapi-dup", slug="fastapi")
    db_session.add(duplicate_slug)
    with pytest.raises(IntegrityError):
        db_session.flush()
