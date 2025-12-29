# articles モデルの挿入、ユニーク制約、カテゴリ FK を確認するテスト
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import Article, Category


def test_article_insert_and_unique_slug(db_session):
    category = Category(name="Backend", slug="backend")
    db_session.add(category)
    db_session.flush()

    article = Article(
        slug="fastapi-intro",
        title="FastAPI Intro",
        content="Hello",
        category_id=category.id,
    )
    db_session.add(article)
    db_session.flush()

    saved = db_session.execute(select(Article).where(Article.slug == "fastapi-intro")).scalar_one()
    assert saved.category_id == category.id

    duplicate_slug = Article(
        slug="fastapi-intro",
        title="Another",
        content="World",
        category_id=category.id,
    )
    db_session.add(duplicate_slug)
    with pytest.raises(IntegrityError):
        db_session.flush()
