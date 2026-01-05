import pytest

from app.models.category import Category
from app.models.tag import Tag

pytestmark = pytest.mark.anyio


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
