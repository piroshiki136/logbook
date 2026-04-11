import pytest
from fastapi import status

from app.core.security import require_admin
from app.main import app
from app.models.category import Category
from app.models.tag import Tag

pytestmark = pytest.mark.anyio


def _set_override(dep, value):
    app.dependency_overrides[dep] = value


def _clear_override(dep):
    app.dependency_overrides.pop(dep, None)


async def test_tags_list_returns_ordered_data(client, db_session):
    db_session.add_all(
        [
            Tag(name="Zeta", slug="zeta"),
            Tag(name="Alpha", slug="alpha"),
        ]
    )
    db_session.flush()

    res = await client.get("/api/tags")
    payload = res.json()

    assert res.status_code == 200
    assert payload["success"] is True
    assert [item["name"] for item in payload["data"]] == ["Alpha", "Zeta"]


async def test_categories_list_returns_ordered_data(client, db_session):
    db_session.add_all(
        [
            Category(name="Design", slug="design", color="#111111", icon="brush"),
            Category(name="Backend", slug="backend", color="#222222", icon="code"),
        ]
    )
    db_session.flush()

    res = await client.get("/api/categories")
    payload = res.json()

    assert res.status_code == 200
    assert payload["success"] is True
    assert [item["name"] for item in payload["data"]] == ["Backend", "Design"]


async def test_tag_update_updates_name_only(client, db_session):
    tag = Tag(name="FastAPI", slug="fastapi")
    db_session.add(tag)
    db_session.flush()

    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.patch(f"/api/tags/{tag.id}", json={"name": "FastAPI Web"})
    finally:
        _clear_override(require_admin)

    payload = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert payload["data"]["name"] == "FastAPI Web"
    assert payload["data"]["slug"] == "fastapi"

    db_session.refresh(tag)
    assert tag.name == "FastAPI Web"
    assert tag.slug == "fastapi"


async def test_category_create_generates_slug(client, db_session):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    try:
        res = await client.post(
            "/api/categories",
            json={
                "name": "Frontend Platform",
                "color": "#123456",
                "icon": "layers",
            },
        )
    finally:
        _clear_override(require_admin)

    payload = res.json()
    assert res.status_code == status.HTTP_201_CREATED
    assert payload["success"] is True
    assert payload["data"]["name"] == "Frontend Platform"
    assert payload["data"]["slug"] == "frontend-platform"
    assert payload["data"]["color"] == "#123456"
    assert payload["data"]["icon"] == "layers"

    saved = db_session.query(Category).filter(Category.slug == "frontend-platform").one()
    assert saved.name == "Frontend Platform"
