from datetime import UTC, datetime, timedelta

import pytest
from fastapi import status

from app.core.security import get_current_user, get_optional_user
from app.core.settings import get_settings
from app.main import app
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag

pytestmark = pytest.mark.anyio


def _set_override(dep, value):
    app.dependency_overrides[dep] = value


def _clear_override(dep):
    app.dependency_overrides.pop(dep, None)


def _create_category(db_session, *, name, slug, color=None, icon=None):
    category = Category(name=name, slug=slug, color=color, icon=icon)
    db_session.add(category)
    db_session.flush()
    return category


def _create_tag(db_session, *, name, slug):
    tag = Tag(name=name, slug=slug)
    db_session.add(tag)
    db_session.flush()
    return tag


def _create_article(
    db_session,
    *,
    category_id,
    slug,
    title,
    published_at,
    created_at,
    updated_at=None,
    is_draft=False,
    tags=None,
):
    article = Article(
        slug=slug,
        title=title,
        content="Body",
        category_id=category_id,
        published_at=published_at,
        created_at=created_at,
        is_draft=is_draft,
    )
    if updated_at is not None:
        article.updated_at = updated_at
    if tags:
        article.tags = tags
    db_session.add(article)
    db_session.flush()
    return article


def _commit(db_session):
    db_session.commit()


async def test_list_articles_excludes_drafts(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="public-article",
        title="Public",
        published_at=base_time,
        created_at=base_time,
        is_draft=False,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="draft-article",
        title="Draft",
        published_at=None,
        created_at=base_time + timedelta(minutes=1),
        is_draft=True,
    )
    _commit(db_session)

    res = await client.get("/api/articles")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert payload["data"]["total"] == 1
    assert [item["slug"] for item in payload["data"]["items"]] == ["public-article"]


async def test_list_articles_excludes_non_draft_without_published_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="public-article",
        title="Public",
        published_at=base_time,
        created_at=base_time,
        is_draft=False,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="hidden-article",
        title="Hidden",
        published_at=None,
        created_at=base_time + timedelta(minutes=1),
        is_draft=False,
    )
    _commit(db_session)

    res = await client.get("/api/articles")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert payload["data"]["total"] == 1
    assert [item["slug"] for item in payload["data"]["items"]] == ["public-article"]


async def test_list_articles_orders_public_by_published_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="newer-published",
        title="Newer Published",
        published_at=base_time + timedelta(minutes=2),
        created_at=base_time,
        updated_at=base_time,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="older-published",
        title="Older Published",
        published_at=base_time + timedelta(minutes=1),
        created_at=base_time + timedelta(minutes=1),
        updated_at=base_time + timedelta(minutes=3),
    )
    _commit(db_session)

    res = await client.get("/api/articles")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in payload["data"]["items"]] == [
        "newer-published",
        "older-published",
    ]


async def test_list_articles_requires_admin_for_draft_filter(client):
    res = await client.get("/api/articles?draft=true")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
    payload = res.json()
    assert payload["error"]["code"] == "AUTH_INVALID_TOKEN"


async def test_list_articles_includes_drafts_for_admin(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="draft-article",
        title="Draft",
        published_at=None,
        created_at=base_time,
        is_draft=True,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="public-article",
        title="Public",
        published_at=base_time,
        created_at=base_time + timedelta(minutes=1),
        is_draft=False,
    )
    _commit(db_session)

    settings = get_settings()
    _set_override(get_optional_user, lambda: {"email": settings.admin_allowed_emails[0]})
    try:
        res = await client.get("/api/articles?draft=true")
    finally:
        _clear_override(get_optional_user)

    payload = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert [item["slug"] for item in payload["data"]["items"]] == ["draft-article"]


async def test_list_articles_orders_drafts_for_admin_by_updated_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="older-update",
        title="Older",
        published_at=base_time,
        created_at=base_time,
        updated_at=base_time + timedelta(minutes=1),
        is_draft=True,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="newer-update",
        title="Newer",
        published_at=base_time - timedelta(minutes=10),
        created_at=base_time - timedelta(minutes=10),
        updated_at=base_time + timedelta(minutes=2),
        is_draft=True,
    )
    _commit(db_session)

    settings = get_settings()
    _set_override(get_optional_user, lambda: {"email": settings.admin_allowed_emails[0]})
    try:
        res = await client.get("/api/articles?draft=true")
    finally:
        _clear_override(get_optional_user)

    payload = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert [item["slug"] for item in payload["data"]["items"]] == [
        "newer-update",
        "older-update",
    ]


async def test_list_articles_orders_all_for_admin_by_updated_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="public-article",
        title="Public",
        published_at=base_time,
        created_at=base_time,
        updated_at=base_time + timedelta(minutes=1),
        is_draft=False,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="draft-article",
        title="Draft",
        published_at=None,
        created_at=base_time + timedelta(minutes=1),
        updated_at=base_time + timedelta(minutes=2),
        is_draft=True,
    )
    _commit(db_session)

    settings = get_settings()
    _set_override(get_optional_user, lambda: {"email": settings.admin_allowed_emails[0]})
    try:
        res = await client.get("/api/articles")
    finally:
        _clear_override(get_optional_user)

    payload = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert [item["slug"] for item in payload["data"]["items"]] == [
        "draft-article",
        "public-article",
    ]


async def test_get_admin_article_by_id_returns_draft_for_admin(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    article = _create_article(
        db_session,
        category_id=category.id,
        slug="draft-article",
        title="Draft",
        published_at=None,
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
        is_draft=True,
    )
    _commit(db_session)

    settings = get_settings()
    _set_override(get_current_user, lambda: {"email": settings.admin_allowed_emails[0]})
    try:
        res = await client.get(f"/api/articles/by-id/{article.id}")
    finally:
        _clear_override(get_current_user)

    payload = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert payload["data"]["id"] == article.id
    assert payload["data"]["slug"] == "draft-article"


async def test_get_admin_article_by_id_requires_admin(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    article = _create_article(
        db_session,
        category_id=category.id,
        slug="private-article",
        title="Private",
        published_at=None,
        created_at=datetime(2024, 1, 1, tzinfo=UTC),
        is_draft=True,
    )
    _commit(db_session)

    res = await client.get(f"/api/articles/by-id/{article.id}")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


async def test_list_articles_filters_by_tags_or(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    tag_a = _create_tag(db_session, name="FastAPI", slug="fastapi")
    tag_b = _create_tag(db_session, name="Next.js", slug="nextjs")
    tag_c = _create_tag(db_session, name="Python", slug="python")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="a-article",
        title="A",
        published_at=base_time,
        created_at=base_time,
        tags=[tag_a],
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="b-article",
        title="B",
        published_at=base_time + timedelta(minutes=1),
        created_at=base_time + timedelta(minutes=1),
        tags=[tag_b],
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="c-article",
        title="C",
        published_at=base_time + timedelta(minutes=2),
        created_at=base_time + timedelta(minutes=2),
        tags=[tag_c],
    )
    _commit(db_session)

    res = await client.get("/api/articles?tags=fastapi&tags=nextjs")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    slugs = [item["slug"] for item in payload["data"]["items"]]
    assert set(slugs) == {"a-article", "b-article"}


async def test_list_articles_filters_by_categories(client, db_session):
    backend = _create_category(db_session, name="Backend", slug="backend")
    frontend = _create_category(db_session, name="Frontend", slug="frontend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=backend.id,
        slug="backend-article",
        title="Backend",
        published_at=base_time,
        created_at=base_time,
    )
    _create_article(
        db_session,
        category_id=frontend.id,
        slug="frontend-article",
        title="Frontend",
        published_at=base_time + timedelta(minutes=1),
        created_at=base_time + timedelta(minutes=1),
    )
    _commit(db_session)

    res = await client.get("/api/articles?categories=backend")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in payload["data"]["items"]] == ["backend-article"]


async def test_list_articles_pagination(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    for idx in range(3):
        _create_article(
            db_session,
            category_id=category.id,
            slug=f"article-{idx}",
            title=f"Article {idx}",
            published_at=base_time + timedelta(minutes=idx),
            created_at=base_time + timedelta(minutes=idx),
        )
    _commit(db_session)

    res = await client.get("/api/articles?limit=2&page=2")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["data"]["total"] == 3
    assert len(payload["data"]["items"]) == 1
    assert payload["data"]["items"][0]["slug"] == "article-0"


async def test_get_article_public_and_draft_visibility(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="public-article",
        title="Public",
        published_at=base_time,
        created_at=base_time,
        is_draft=False,
    )
    _create_article(
        db_session,
        category_id=category.id,
        slug="draft-article",
        title="Draft",
        published_at=None,
        created_at=base_time + timedelta(minutes=1),
        is_draft=True,
    )
    _commit(db_session)

    res_public = await client.get("/api/articles/public-article")
    assert res_public.status_code == status.HTTP_200_OK

    res_draft = await client.get("/api/articles/draft-article")
    assert res_draft.status_code == status.HTTP_404_NOT_FOUND


async def test_get_article_hides_non_draft_without_published_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="unpublished-article",
        title="Unpublished",
        published_at=None,
        created_at=base_time,
        is_draft=False,
    )
    _commit(db_session)

    res = await client.get("/api/articles/unpublished-article")
    assert res.status_code == status.HTTP_404_NOT_FOUND


async def test_get_article_draft_visible_for_admin(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    _create_article(
        db_session,
        category_id=category.id,
        slug="draft-article",
        title="Draft",
        published_at=None,
        created_at=base_time,
        is_draft=True,
    )
    _commit(db_session)

    settings = get_settings()
    _set_override(get_optional_user, lambda: {"email": settings.admin_allowed_emails[0]})
    try:
        res = await client.get("/api/articles/draft-article")
    finally:
        _clear_override(get_optional_user)

    assert res.status_code == status.HTTP_200_OK
    payload = res.json()
    assert payload["data"]["isDraft"] is True


async def test_newer_older_orders_by_published_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    earliest_published = _create_article(
        db_session,
        category_id=category.id,
        slug="earliest-published",
        title="Earliest Published",
        published_at=base_time,
        created_at=base_time,
        updated_at=base_time + timedelta(minutes=1),
    )
    middle = _create_article(
        db_session,
        category_id=category.id,
        slug="middle",
        title="Middle",
        published_at=base_time + timedelta(minutes=2),
        created_at=base_time + timedelta(minutes=1),
        updated_at=base_time + timedelta(minutes=3),
    )
    latest_published = _create_article(
        db_session,
        category_id=category.id,
        slug="latest-published",
        title="Latest Published",
        published_at=base_time + timedelta(minutes=4),
        created_at=base_time + timedelta(minutes=2),
        updated_at=base_time + timedelta(minutes=2),
    )
    _commit(db_session)

    res = await client.get(f"/api/articles/{middle.id}/newer-older")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["data"]["newer"]["id"] == latest_published.id
    assert payload["data"]["older"]["id"] == earliest_published.id


async def test_newer_older_hides_draft_from_public(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    draft = _create_article(
        db_session,
        category_id=category.id,
        slug="draft",
        title="Draft",
        published_at=None,
        created_at=base_time,
        is_draft=True,
    )
    _commit(db_session)

    res = await client.get(f"/api/articles/{draft.id}/newer-older")
    assert res.status_code == status.HTTP_404_NOT_FOUND


async def test_newer_older_hides_non_draft_without_published_at_from_public(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    unpublished = _create_article(
        db_session,
        category_id=category.id,
        slug="unpublished",
        title="Unpublished",
        published_at=None,
        created_at=base_time,
        is_draft=False,
    )
    _commit(db_session)

    res = await client.get(f"/api/articles/{unpublished.id}/newer-older")
    assert res.status_code == status.HTTP_404_NOT_FOUND
