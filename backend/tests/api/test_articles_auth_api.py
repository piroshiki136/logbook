from datetime import UTC, datetime

import pytest
from fastapi import status

from app.core.security import get_current_user, require_admin
from app.main import app
from app.models.article import Article
from app.models.category import Category


def _set_override(dep, value):
    app.dependency_overrides[dep] = value


def _clear_override(dep):
    app.dependency_overrides.pop(dep, None)


def _create_category(db_session, *, name="Backend", slug="backend"):
    category = Category(name=name, slug=slug)
    db_session.add(category)
    db_session.flush()
    return category


def _create_article(db_session, *, category_id, slug="sample", is_draft=False):
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


pytestmark = pytest.mark.anyio


async def test_article_create_requires_auth(client):
    payload = {
        "title": "New",
        "content": "Body",
        "category": "backend",
        "tags": [],
        "isDraft": True,
    }

    res = await client.post("/api/articles", json=payload)
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


async def test_article_create_forbidden_for_non_admin(client):
    _set_override(get_current_user, lambda: {"email": "other@example.com"})
    try:
        payload = {
            "title": "New",
            "content": "Body",
            "category": "backend",
            "tags": [],
            "isDraft": True,
        }

        res = await client.post("/api/articles", json=payload)
        assert res.status_code == status.HTTP_403_FORBIDDEN
    finally:
        _clear_override(get_current_user)


async def test_article_update_requires_auth(client):
    res = await client.patch("/api/articles/1", json={"title": "Updated"})
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


async def test_article_update_forbidden_for_non_admin(client):
    _set_override(get_current_user, lambda: {"email": "other@example.com"})
    try:
        res = await client.patch("/api/articles/1", json={"title": "Updated"})
        assert res.status_code == status.HTTP_403_FORBIDDEN
    finally:
        _clear_override(get_current_user)


async def test_article_delete_requires_auth(client):
    res = await client.delete("/api/articles/1")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


async def test_article_delete_forbidden_for_non_admin(client):
    _set_override(get_current_user, lambda: {"email": "other@example.com"})
    try:
        res = await client.delete("/api/articles/1")
        assert res.status_code == status.HTTP_403_FORBIDDEN
    finally:
        _clear_override(get_current_user)


async def test_article_list_validation_error_returns_unified_format(client):
    res = await client.get("/api/articles?page=0")
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    payload = res.json()
    assert payload["error"]["code"] == "REQUEST_VALIDATION_ERROR"


async def test_article_create_validation_error_returns_unified_format(client):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.post("/api/articles", json={})
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        payload = res.json()
        assert payload["error"]["code"] == "REQUEST_VALIDATION_ERROR"
    finally:
        _clear_override(require_admin)


async def test_article_update_validation_error_returns_unified_format(client, db_session):
    category = _create_category(db_session)
    article = _create_article(db_session, category_id=category.id)

    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.patch(
            f"/api/articles/{article.id}",
            json={"slug": "bad slug"},
        )
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        payload = res.json()
        assert payload["error"]["code"] == "REQUEST_VALIDATION_ERROR"
    finally:
        _clear_override(require_admin)
