from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select

from app.core.exceptions import AppError
from app.core.settings import get_settings
from app.models import Article, Category, Tag
from app.schemas.article import ArticleCreate, ArticlePatch
from app.schemas.article_query import ArticleListQuery
from app.services import articles as article_service


def _create_category(db_session, slug: str, name: str) -> Category:
    category = Category(name=name, slug=slug)
    db_session.add(category)
    db_session.flush()
    db_session.refresh(category)
    return category


def _get_article(db_session, article_id: int) -> Article:
    return db_session.scalar(select(Article).where(Article.id == article_id))


def test_create_article_normalizes_tags(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    payload = ArticleCreate(
        title="Tag Normalize",
        content="Hello",
        category="backend",
        tags=["Python", "python", "Ｃ＋＋", "C++"],
    )
    response = article_service.create_article(payload=payload, db=db_session)

    tags = db_session.scalars(select(Tag).order_by(Tag.slug)).all()
    tag_slugs = [tag.slug for tag in tags]
    assert tag_slugs == ["c++", "python"]
    assert response.data is not None
    assert sorted(response.data.tags) == ["c++", "python"]


def test_create_article_generates_slug_when_missing(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    payload = ArticleCreate(
        title="Hello World",
        content="Hello",
        category="backend",
    )
    response = article_service.create_article(payload=payload, db=db_session)

    assert response.data is not None
    assert response.data.slug == "hello-world"


def test_create_article_rejects_duplicate_slug(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    first = ArticleCreate(
        title="First",
        slug="dup-slug",
        content="Hello",
        category="backend",
    )
    article_service.create_article(payload=first, db=db_session)

    second = ArticleCreate(
        title="Second",
        slug="dup-slug",
        content="Hello",
        category="backend",
    )
    with pytest.raises(AppError) as exc:
        article_service.create_article(payload=second, db=db_session)

    assert exc.value.code == "SLUG_ALREADY_EXISTS"
    assert exc.value.status_code == 409


def test_published_at_behavior_on_create_and_update(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    draft_payload = ArticleCreate(
        title="Draft",
        content="Hello",
        category="backend",
        is_draft=True,
    )
    draft_response = article_service.create_article(payload=draft_payload, db=db_session)
    assert draft_response.data is not None
    assert draft_response.data.published_at is None

    publish_payload = ArticleCreate(
        title="Published",
        content="Hello",
        category="backend",
        is_draft=False,
    )
    publish_response = article_service.create_article(payload=publish_payload, db=db_session)
    assert publish_response.data is not None
    assert publish_response.data.published_at is not None

    updated = article_service.update_article(
        article_id=draft_response.data.id,
        payload=ArticlePatch(is_draft=False),
        db=db_session,
    )
    assert updated.data is not None
    assert updated.data.published_at is not None

    republished = article_service.update_article(
        article_id=updated.data.id,
        payload=ArticlePatch(is_draft=True),
        db=db_session,
    )
    assert republished.data is not None
    assert republished.data.published_at is not None


def test_list_articles_filters_drafts_for_non_admin(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    draft_payload = ArticleCreate(
        title="Draft",
        content="Hello",
        category="backend",
        is_draft=True,
    )
    published_payload = ArticleCreate(
        title="Published",
        content="Hello",
        category="backend",
        is_draft=False,
    )
    article_service.create_article(payload=draft_payload, db=db_session)
    article_service.create_article(payload=published_payload, db=db_session)

    query = ArticleListQuery(page=1, limit=10)
    response = article_service.list_articles(query=query, db=db_session, user=None)
    assert response.data is not None
    assert [item.title for item in response.data.items] == ["Published"]


def test_list_articles_excludes_unpublished_non_draft_for_non_admin(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    published = ArticleCreate(
        title="Published",
        content="Hello",
        category="backend",
        is_draft=False,
    )
    article_service.create_article(payload=published, db=db_session)

    hidden = Article(
        title="Hidden",
        slug="hidden",
        content="Hello",
        category=_create_category(db_session, slug="ops", name="Ops"),
        is_draft=False,
        published_at=None,
    )
    db_session.add(hidden)
    db_session.commit()

    query = ArticleListQuery(page=1, limit=10)
    response = article_service.list_articles(query=query, db=db_session, user=None)

    assert response.data is not None
    assert [item.title for item in response.data.items] == ["Published"]


def test_list_articles_rejects_draft_query_for_non_admin(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    query = ArticleListQuery(page=1, limit=10, draft=True)
    with pytest.raises(AppError) as exc:
        article_service.list_articles(query=query, db=db_session, user=None)

    assert exc.value.code == "AUTH_INVALID_TOKEN"
    assert exc.value.status_code == 401


def test_list_articles_allows_draft_query_for_admin(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    draft_payload = ArticleCreate(
        title="Draft",
        content="Hello",
        category="backend",
        is_draft=True,
    )
    article_service.create_article(payload=draft_payload, db=db_session)

    settings = get_settings()
    admin_user = {"email": settings.admin_allowed_emails[0]}
    query = ArticleListQuery(page=1, limit=10, draft=True)
    response = article_service.list_articles(query=query, db=db_session, user=admin_user)

    assert response.data is not None
    assert [item.title for item in response.data.items] == ["Draft"]


def test_list_articles_orders_draft_for_admin_by_updated_at(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    first = article_service.create_article(
        payload=ArticleCreate(
            title="First Draft",
            content="Hello",
            category="backend",
            is_draft=True,
        ),
        db=db_session,
    )
    second = article_service.create_article(
        payload=ArticleCreate(
            title="Second Draft",
            content="Hello",
            category="backend",
            is_draft=True,
        ),
        db=db_session,
    )

    base_time = datetime(2025, 1, 1, tzinfo=UTC)
    first_article = _get_article(db_session, first.data.id)
    second_article = _get_article(db_session, second.data.id)
    first_article.updated_at = base_time + timedelta(minutes=2)
    second_article.updated_at = base_time + timedelta(minutes=1)
    db_session.commit()

    settings = get_settings()
    admin_user = {"email": settings.admin_allowed_emails[0]}
    query = ArticleListQuery(page=1, limit=10, draft=True)
    response = article_service.list_articles(query=query, db=db_session, user=admin_user)

    assert response.data is not None
    assert [item.title for item in response.data.items] == ["First Draft", "Second Draft"]


def test_list_articles_orders_all_for_admin_by_updated_at(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    public_response = article_service.create_article(
        payload=ArticleCreate(
            title="Public Article",
            content="Hello",
            category="backend",
            is_draft=False,
        ),
        db=db_session,
    )
    draft_response = article_service.create_article(
        payload=ArticleCreate(
            title="Draft Article",
            content="Hello",
            category="backend",
            is_draft=True,
        ),
        db=db_session,
    )

    base_time = datetime(2025, 1, 1, tzinfo=UTC)
    public_article = _get_article(db_session, public_response.data.id)
    draft_article = _get_article(db_session, draft_response.data.id)
    public_article.updated_at = base_time + timedelta(minutes=1)
    draft_article.updated_at = base_time + timedelta(minutes=2)
    db_session.commit()

    settings = get_settings()
    admin_user = {"email": settings.admin_allowed_emails[0]}
    query = ArticleListQuery(page=1, limit=10, draft=None)
    response = article_service.list_articles(query=query, db=db_session, user=admin_user)

    assert response.data is not None
    assert [item.title for item in response.data.items] == ["Draft Article", "Public Article"]


def test_get_article_hides_draft_from_non_admin(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    draft_payload = ArticleCreate(
        title="Draft",
        content="Hello",
        category="backend",
        is_draft=True,
    )
    response = article_service.create_article(payload=draft_payload, db=db_session)

    with pytest.raises(AppError) as exc:
        article_service.get_article(
            slug=response.data.slug,
            db=db_session,
            user=None,
        )

    assert exc.value.code == "ARTICLE_NOT_FOUND"
    assert exc.value.status_code == 404


def test_get_article_hides_non_draft_without_published_at_from_non_admin(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    response = article_service.create_article(
        payload=ArticleCreate(
            title="Unpublished",
            content="Hello",
            category="backend",
            is_draft=False,
        ),
        db=db_session,
    )
    article = _get_article(db_session, response.data.id)
    article.published_at = None
    db_session.commit()

    with pytest.raises(AppError) as exc:
        article_service.get_article(
            slug=response.data.slug,
            db=db_session,
            user=None,
        )

    assert exc.value.code == "ARTICLE_NOT_FOUND"
    assert exc.value.status_code == 404


def test_list_articles_filters_by_tags_and_categories(db_session):
    _create_category(db_session, slug="backend", name="Backend")
    _create_category(db_session, slug="frontend", name="Frontend")

    backend_article = ArticleCreate(
        title="Backend",
        content="Hello",
        category="backend",
        tags=["Python"],
        is_draft=False,
    )
    frontend_article = ArticleCreate(
        title="Frontend",
        content="Hello",
        category="frontend",
        tags=["NextJS"],
        is_draft=False,
    )
    article_service.create_article(payload=backend_article, db=db_session)
    article_service.create_article(payload=frontend_article, db=db_session)

    query = ArticleListQuery(page=1, limit=10, categories=["backend"])
    response = article_service.list_articles(query=query, db=db_session, user=None)
    assert response.data is not None
    assert [item.title for item in response.data.items] == ["Backend"]

    query = ArticleListQuery(page=1, limit=10, tags=["PYTHON"])
    response = article_service.list_articles(query=query, db=db_session, user=None)
    assert response.data is not None
    assert [item.title for item in response.data.items] == ["Backend"]


def test_get_prev_next_uses_published_order_and_excludes_drafts_for_public(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    first = article_service.create_article(
        payload=ArticleCreate(
            title="First",
            content="Hello",
            category="backend",
            is_draft=False,
        ),
        db=db_session,
    )
    second = article_service.create_article(
        payload=ArticleCreate(
            title="Second",
            content="Hello",
            category="backend",
            is_draft=False,
        ),
        db=db_session,
    )
    third = article_service.create_article(
        payload=ArticleCreate(
            title="Third",
            content="Hello",
            category="backend",
            is_draft=False,
        ),
        db=db_session,
    )

    draft = article_service.create_article(
        payload=ArticleCreate(
            title="Draft",
            content="Hello",
            category="backend",
            is_draft=True,
        ),
        db=db_session,
    )

    base_time = datetime(2025, 1, 1, tzinfo=UTC)
    article_times = {
        first.data.id: base_time + timedelta(days=2),
        second.data.id: base_time + timedelta(days=1),
        third.data.id: base_time,
        draft.data.id: base_time + timedelta(days=3),
    }

    for article_id, published_at in article_times.items():
        article = _get_article(db_session, article_id)
        article.published_at = published_at if not article.is_draft else None
        article.created_at = published_at
    db_session.commit()

    response = article_service.get_prev_next(
        article_id=second.data.id,
        db=db_session,
        user=None,
    )

    assert response.data is not None
    assert response.data.prev is not None
    assert response.data.next is not None
    assert response.data.prev.slug == first.data.slug
    assert response.data.next.slug == third.data.slug


def test_get_prev_next_hides_non_draft_without_published_at_from_public(db_session):
    _create_category(db_session, slug="backend", name="Backend")

    response = article_service.create_article(
        payload=ArticleCreate(
            title="Unpublished",
            content="Hello",
            category="backend",
            is_draft=False,
        ),
        db=db_session,
    )
    article = _get_article(db_session, response.data.id)
    article.published_at = None
    db_session.commit()

    with pytest.raises(AppError) as exc:
        article_service.get_prev_next(
            article_id=response.data.id,
            db=db_session,
            user=None,
        )

    assert exc.value.code == "ARTICLE_NOT_FOUND"
    assert exc.value.status_code == 404
