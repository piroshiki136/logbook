from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.response import ApiResponse
from app.core.security import get_optional_user, require_admin
from app.db.session import get_db
from app.schemas.article import (
    ArticleCreate,
    ArticleDetail,
    ArticleListResponse,
    ArticlePatch,
    ArticlePrevNextResponse,
)
from app.schemas.article_query import ArticleListQuery
from app.services import articles as article_service

router = APIRouter()


@router.get(
    "/articles",
    response_model=ApiResponse[ArticleListResponse],
)
def list_articles(
    query: ArticleListQuery = Depends(),
    db: Session = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    return article_service.list_articles(query=query, db=db, user=user)


@router.get(
    "/articles/{slug}",
    response_model=ApiResponse[ArticleDetail],
)
def get_article(
    slug: str,
    db: Session = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    return article_service.get_article(slug=slug, db=db, user=user)


@router.post(
    "/articles",
    response_model=ApiResponse[ArticleDetail],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_article(
    payload: ArticleCreate,
    db: Session = Depends(get_db),
):
    return article_service.create_article(payload=payload, db=db)


@router.patch(
    "/articles/{article_id}",
    response_model=ApiResponse[ArticleDetail],
    dependencies=[Depends(require_admin)],
)
def update_article(
    article_id: int,
    payload: ArticlePatch,
    db: Session = Depends(get_db),
):
    return article_service.update_article(article_id=article_id, payload=payload, db=db)


@router.delete(
    "/articles/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
):
    return article_service.delete_article(article_id=article_id, db=db)


@router.get(
    "/articles/{article_id}/prev-next",
    response_model=ApiResponse[ArticlePrevNextResponse],
)
def get_prev_next(
    article_id: int,
    db: Session = Depends(get_db),
    user: dict | None = Depends(get_optional_user),
):
    return article_service.get_prev_next(article_id=article_id, db=db, user=user)
