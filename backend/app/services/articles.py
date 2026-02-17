from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.normalization import normalize_tag_key
from app.core.response import ApiResponse
from app.core.security import is_admin_user
from app.core.slug import ensure_unique_slug, slugify
from app.models.article import Article
from app.models.category import Category
from app.models.tag import Tag
from app.schemas.article import (
    ArticleCreate,
    ArticleDetail,
    ArticleListResponse,
    ArticleNeighbor,
    ArticlePatch,
    ArticlePrevNextResponse,
    ArticleSummary,
)
from app.schemas.article_query import ArticleListQuery


def list_articles(
    *, query: ArticleListQuery, db: Session, user: dict | None
) -> ApiResponse[ArticleListResponse]:
    is_admin = user is not None and is_admin_user(user)
    if query.draft is not None and not is_admin:
        raise AppError(
            code="AUTH_INVALID_TOKEN",
            message="認証に失敗しました",
            status_code=401,
        )

    stmt = select(Article).options(
        selectinload(Article.tags),
        selectinload(Article.category),
    )

    if query.draft is None:
        if not is_admin:
            stmt = stmt.where(Article.is_draft.is_(False))
    else:
        stmt = stmt.where(Article.is_draft.is_(query.draft))

    if query.categories:
        stmt = stmt.where(Article.category.has(Category.slug.in_(query.categories)))

    if query.tags:
        stmt = stmt.where(Article.tags.any(Tag.slug.in_(query.tags)))

    if query.draft is True:
        stmt = stmt.order_by(
            Article.updated_at.desc(),
            Article.created_at.desc(),
            Article.id.desc(),
        )
    else:
        stmt = stmt.order_by(
            Article.published_at.desc().nullslast(),
            Article.created_at.desc(),
            Article.id.desc(),
        )

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    offset = (query.page - 1) * query.limit
    items = db.scalars(stmt.offset(offset).limit(query.limit)).all()

    return ApiResponse(
        success=True,
        data=ArticleListResponse(
            items=[_article_summary(article) for article in items],
            total=total,
            page=query.page,
            limit=query.limit,
        ),
    )


def get_article(*, slug: str, db: Session, user: dict | None) -> ApiResponse[ArticleDetail]:
    is_admin = user is not None and is_admin_user(user)
    stmt = (
        select(Article)
        .options(
            selectinload(Article.tags),
            selectinload(Article.category),
        )
        .where(Article.slug == slug)
    )

    if not is_admin:
        stmt = stmt.where(Article.is_draft.is_(False))

    article = db.scalar(stmt)
    if not article:
        raise AppError(
            code="ARTICLE_NOT_FOUND",
            message="記事が見つかりません",
            status_code=404,
        )

    return ApiResponse(
        success=True,
        data=_article_detail(article),
    )


def create_article(*, payload: ArticleCreate, db: Session) -> ApiResponse[ArticleDetail]:
    category = _ensure_category(db, payload.category)
    slug = _apply_slug_rules(db, title=payload.title, slug=payload.slug)
    tags = _get_or_create_tags(db, payload.tags)

    published_at = None
    if not payload.is_draft:
        published_at = _now()

    article = Article(
        title=payload.title,
        slug=slug,
        content=payload.content,
        category=category,
        tags=tags,
        is_draft=payload.is_draft,
        published_at=published_at,
    )

    db.add(article)
    db.commit()
    db.refresh(article)

    return ApiResponse(
        success=True,
        data=_article_detail(article),
    )


def update_article(
    *, article_id: int, payload: ArticlePatch, db: Session
) -> ApiResponse[ArticleDetail]:
    article = db.scalar(
        select(Article)
        .options(selectinload(Article.tags), selectinload(Article.category))
        .where(Article.id == article_id)
    )
    if not article:
        raise AppError(
            code="ARTICLE_NOT_FOUND",
            message="記事が見つかりません",
            status_code=404,
        )

    if payload.title is not None:
        article.title = payload.title

    if payload.slug is not None:
        article.slug = _apply_slug_rules(
            db,
            title=article.title,
            slug=payload.slug,
            article_id=article.id,
        )

    if payload.content is not None:
        article.content = payload.content

    if payload.category is not None:
        article.category = _ensure_category(db, payload.category)

    if payload.tags is not None:
        article.tags = _get_or_create_tags(db, payload.tags)

    if payload.is_draft is not None:
        if payload.is_draft is False and article.is_draft is True:
            article.published_at = _now()
        article.is_draft = payload.is_draft

    db.commit()
    db.refresh(article)

    return ApiResponse(
        success=True,
        data=_article_detail(article),
    )


def delete_article(*, article_id: int, db: Session) -> None:
    article = db.scalar(select(Article).where(Article.id == article_id))
    if not article:
        raise AppError(
            code="ARTICLE_NOT_FOUND",
            message="記事が見つかりません",
            status_code=404,
        )

    db.delete(article)
    db.commit()


def get_prev_next(
    *, article_id: int, db: Session, user: dict | None
) -> ApiResponse[ArticlePrevNextResponse]:
    is_admin = user is not None and is_admin_user(user)

    base_stmt = select(Article).where(Article.id == article_id)
    if not is_admin:
        base_stmt = base_stmt.where(Article.is_draft.is_(False))

    current = db.scalar(base_stmt)
    if not current:
        raise AppError(
            code="ARTICLE_NOT_FOUND",
            message="記事が見つかりません",
            status_code=404,
        )

    order_clause = (
        Article.published_at.desc().nullslast(),
        Article.created_at.desc(),
        Article.id.desc(),
    )

    scope_stmt = select(
        Article.id.label("article_id"),
        func.row_number().over(order_by=order_clause).label("rn"),
    )
    if not is_admin:
        scope_stmt = scope_stmt.where(Article.is_draft.is_(False))

    scope_subquery = scope_stmt.subquery()
    current_rn = db.scalar(
        select(scope_subquery.c.rn).where(scope_subquery.c.article_id == current.id)
    )

    prev_article: Article | None = None
    next_article: Article | None = None

    if current_rn is not None:
        neighbor_rows = db.execute(
            select(Article, scope_subquery.c.rn)
            .join(scope_subquery, scope_subquery.c.article_id == Article.id)
            .where(scope_subquery.c.rn.in_([current_rn - 1, current_rn + 1]))
            .order_by(scope_subquery.c.rn)
        ).all()

        for article, rn in neighbor_rows:
            if rn == current_rn - 1:
                prev_article = article
            elif rn == current_rn + 1:
                next_article = article

    def to_neighbor(article: Article | None) -> ArticleNeighbor | None:
        if article is None:
            return None
        return ArticleNeighbor(
            id=article.id,
            slug=article.slug,
            title=article.title,
            created_at=article.created_at,
            published_at=article.published_at,
            is_draft=article.is_draft,
        )

    return ApiResponse(
        success=True,
        data=ArticlePrevNextResponse(
            prev=to_neighbor(prev_article),
            next=to_neighbor(next_article),
        ),
    )


def _now() -> datetime:
    return datetime.now(UTC)


def _article_summary(article: Article) -> ArticleSummary:
    return ArticleSummary(
        id=article.id,
        slug=article.slug,
        title=article.title,
        category=article.category.slug,
        tags=[tag.slug for tag in article.tags],
        created_at=article.created_at,
        updated_at=article.updated_at,
        published_at=article.published_at,
        is_draft=article.is_draft,
    )


def _article_detail(article: Article) -> ArticleDetail:
    summary = _article_summary(article)
    return ArticleDetail(
        **summary.model_dump(),
        content=article.content,
    )


def _ensure_category(session: Session, slug: str) -> Category:
    category = session.scalar(select(Category).where(Category.slug == slug))
    if not category:
        raise AppError(
            code="REQUEST_FAILED",
            message="カテゴリが見つかりません",
            status_code=400,
        )
    return category


def _get_or_create_tags(session: Session, slugs: list[str]) -> list[Tag]:
    if not slugs:
        return []

    normalized_pairs: list[tuple[str, str]] = []
    seen: set[str] = set()

    for raw in slugs:
        normalized = normalize_tag_key(raw)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        normalized_pairs.append((normalized, raw.strip()))

    if not normalized_pairs:
        return []

    normalized_slugs = [slug for slug, _ in normalized_pairs]
    tags = session.scalars(select(Tag).where(Tag.slug.in_(normalized_slugs))).all()
    existing = {tag.slug for tag in tags}

    for slug, name in normalized_pairs:
        if slug in existing:
            continue
        tag = Tag(name=name or slug, slug=slug)
        session.add(tag)
        tags.append(tag)

    return tags


def _apply_slug_rules(
    session: Session, *, title: str, slug: str | None, article_id: int | None = None
) -> str:
    if slug:
        conditions = [Article.slug == slug]
        if article_id is not None:
            conditions.append(Article.id != article_id)
        exists = session.scalar(select(Article.id).where(*conditions))
        if exists:
            raise AppError(
                code="SLUG_ALREADY_EXISTS",
                message="同じ slug の記事が既に存在します",
                status_code=409,
            )
        return slug

    base_slug = slugify(title)
    if not base_slug:
        raise AppError(
            code="REQUEST_FAILED",
            message="タイトルから slug を生成できません",
            status_code=400,
        )

    return ensure_unique_slug(session, base_slug)
