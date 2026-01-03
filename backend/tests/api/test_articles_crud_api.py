from datetime import UTC, datetime

import pytest
from fastapi import status
from sqlalchemy import select

from app.core.security import require_admin
from app.main import app
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag

pytestmark = pytest.mark.anyio


def _set_override(dep, value):
    app.dependency_overrides[dep] = value


def _clear_override(dep):
    app.dependency_overrides.pop(dep, None)


def _create_category(db_session, *, name="Backend", slug="backend"):
    category = Category(name=name, slug=slug)
    db_session.add(category)
    db_session.flush()
    return category


def _create_article(db_session, *, category_id, slug="sample", is_draft=True):
    article = Article(
        title="Sample",
        slug=slug,
        content="Body",
        category_id=category_id,
        is_draft=is_draft,
        published_at=None if is_draft else datetime.now(UTC),
    )
    db_session.add(article)
    db_session.flush()
    return article


async def test_article_create_succeeds_for_admin(client, db_session):
    _create_category(db_session)

    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        payload = {
            "title": "New Article",
            "slug": "new-article",
            "content": "Body",
            "category": "backend",
            "tags": ["Python"],
            "isDraft": True,
        }
        res = await client.post("/api/articles", json=payload)
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_201_CREATED
    body = res.json()
    assert body["success"] is True
    assert body["data"]["slug"] == "new-article"
    assert body["data"]["tags"] == ["python"]
    assert body["data"]["isDraft"] is True
    assert body["data"]["publishedAt"] is None

    tags = db_session.scalars(select(Tag).order_by(Tag.slug)).all()
    assert [tag.slug for tag in tags] == ["python"]


async def test_article_create_missing_category_returns_400(client):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        payload = {
            "title": "New Article",
            "content": "Body",
            "category": "missing",
            "tags": [],
            "isDraft": False,
        }
        res = await client.post("/api/articles", json=payload)
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_400_BAD_REQUEST
    body = res.json()
    assert body["error"]["code"] == "REQUEST_FAILED"


async def test_article_create_invalid_slug_returns_422(client):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        payload = {
            "title": "New Article",
            "slug": "bad slug",
            "content": "Body",
            "category": "backend",
            "tags": [],
            "isDraft": False,
        }
        res = await client.post("/api/articles", json=payload)
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    body = res.json()
    assert body["error"]["code"] == "REQUEST_VALIDATION_ERROR"


async def test_article_update_succeeds_and_sets_published_at(client, db_session):
    category = _create_category(db_session)
    article = _create_article(db_session, category_id=category.id, is_draft=True)

    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.patch(
            f"/api/articles/{article.id}",
            json={"title": "Updated", "isDraft": False, "tags": ["Python"]},
        )
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_200_OK
    body = res.json()
    assert body["data"]["title"] == "Updated"
    assert body["data"]["isDraft"] is False
    assert body["data"]["publishedAt"] is not None
    assert body["data"]["tags"] == ["python"]


async def test_article_update_not_found_returns_404(client):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.patch("/api/articles/999", json={"title": "Updated"})
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_404_NOT_FOUND
    body = res.json()
    assert body["error"]["code"] == "ARTICLE_NOT_FOUND"


async def test_article_delete_succeeds_for_admin(client, db_session):
    category = _create_category(db_session)
    article = _create_article(db_session, category_id=category.id, is_draft=False)

    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.delete(f"/api/articles/{article.id}")
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert db_session.scalar(select(Article).where(Article.id == article.id)) is None


async def test_article_delete_not_found_returns_404(client):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.delete("/api/articles/999")
    finally:
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_404_NOT_FOUND
    body = res.json()
    assert body["error"]["code"] == "ARTICLE_NOT_FOUND"


async def test_prev_next_not_found_returns_404(client):
    res = await client.get("/api/articles/1/prev-next")
    assert res.status_code == status.HTTP_404_NOT_FOUND
    body = res.json()
    assert body["error"]["code"] == "ARTICLE_NOT_FOUND"


async def test_list_articles_limit_validation_error(client):
    res = await client.get("/api/articles?limit=51")
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    body = res.json()
    assert body["error"]["code"] == "REQUEST_VALIDATION_ERROR"


async def test_list_articles_rejects_invalid_token(client):
    res = await client.get("/api/articles", headers={"Authorization": "Bearer invalid"})
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
    body = res.json()
    assert body["error"]["code"] == "AUTH_INVALID_TOKEN"
