from datetime import UTC, datetime, timedelta

from fastapi import status

from app.core.security import get_optional_user
from app.main import app
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag


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
    if tags:
        article.tags = tags
    db_session.add(article)
    db_session.flush()
    return article


def _commit(db_session):
    db_session.commit()


def test_list_articles_excludes_drafts(client, db_session):
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

    res = client.get("/api/articles")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert payload["data"]["total"] == 1
    assert [item["slug"] for item in payload["data"]["items"]] == ["public-article"]


def test_list_articles_requires_admin_for_draft_filter(client):
    res = client.get("/api/articles?draft=true")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
    payload = res.json()
    assert payload["error"]["code"] == "AUTH_INVALID_TOKEN"


def test_list_articles_includes_drafts_for_admin(client, db_session):
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

    _set_override(get_optional_user, lambda: {"email": "test@example.com"})
    try:
        res = client.get("/api/articles?draft=true")
    finally:
        _clear_override(get_optional_user)

    payload = res.json()
    assert res.status_code == status.HTTP_200_OK
    assert payload["success"] is True
    assert [item["slug"] for item in payload["data"]["items"]] == ["draft-article"]


def test_list_articles_filters_by_tags_or(client, db_session):
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

    res = client.get("/api/articles?tags=fastapi&tags=nextjs")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    slugs = [item["slug"] for item in payload["data"]["items"]]
    assert set(slugs) == {"a-article", "b-article"}


def test_list_articles_filters_by_categories(client, db_session):
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

    res = client.get("/api/articles?categories=backend")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert [item["slug"] for item in payload["data"]["items"]] == ["backend-article"]


def test_list_articles_pagination(client, db_session):
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

    res = client.get("/api/articles?limit=2&page=2")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["data"]["total"] == 3
    assert len(payload["data"]["items"]) == 1
    assert payload["data"]["items"][0]["slug"] == "article-0"


def test_get_article_public_and_draft_visibility(client, db_session):
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

    res_public = client.get("/api/articles/public-article")
    assert res_public.status_code == status.HTTP_200_OK

    res_draft = client.get("/api/articles/draft-article")
    assert res_draft.status_code == status.HTTP_404_NOT_FOUND


def test_get_article_draft_visible_for_admin(client, db_session):
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

    _set_override(get_optional_user, lambda: {"email": "test@example.com"})
    try:
        res = client.get("/api/articles/draft-article")
    finally:
        _clear_override(get_optional_user)

    assert res.status_code == status.HTTP_200_OK
    payload = res.json()
    assert payload["data"]["isDraft"] is True


def test_prev_next_orders_by_published_at(client, db_session):
    category = _create_category(db_session, name="Backend", slug="backend")
    base_time = datetime(2024, 1, 1, tzinfo=UTC)

    newest = _create_article(
        db_session,
        category_id=category.id,
        slug="newest",
        title="Newest",
        published_at=base_time + timedelta(minutes=2),
        created_at=base_time + timedelta(minutes=2),
    )
    middle = _create_article(
        db_session,
        category_id=category.id,
        slug="middle",
        title="Middle",
        published_at=base_time + timedelta(minutes=1),
        created_at=base_time + timedelta(minutes=1),
    )
    oldest = _create_article(
        db_session,
        category_id=category.id,
        slug="oldest",
        title="Oldest",
        published_at=base_time,
        created_at=base_time,
    )
    _commit(db_session)

    res = client.get(f"/api/articles/{middle.id}/prev-next")
    payload = res.json()

    assert res.status_code == status.HTTP_200_OK
    assert payload["data"]["prev"]["id"] == newest.id
    assert payload["data"]["next"]["id"] == oldest.id


def test_prev_next_hides_draft_from_public(client, db_session):
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

    res = client.get(f"/api/articles/{draft.id}/prev-next")
    assert res.status_code == status.HTTP_404_NOT_FOUND
