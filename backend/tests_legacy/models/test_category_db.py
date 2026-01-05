# categories モデルの挿入とユニーク制約を確認するテスト
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import Category


def test_category_insert_and_unique_slug(db_session):
    category = Category(name="Backend", slug="backend", color="red", icon="server")
    db_session.add(category)
    db_session.flush()

    saved = db_session.execute(select(Category).where(Category.slug == "backend")).scalar_one()
    assert saved.name == "Backend"

    duplicate = Category(name="Backend2", slug="backend")
    db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_category_unique_name(db_session):
    category = Category(name="Backend", slug="backend", color="red", icon="server")
    db_session.add(category)
    db_session.flush()

    duplicate_name = Category(name="Backend", slug="backend-2")
    db_session.add(duplicate_name)
    with pytest.raises(IntegrityError):
        db_session.flush()
