from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.response import ApiResponse
from app.core.security import require_admin
from app.core.slug import slugify
from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryRead

router = APIRouter()


@router.get(
    "/categories",
    response_model=ApiResponse[list[CategoryRead]],
)
def list_categories(
    db: Session = Depends(get_db),
):
    categories = db.scalars(select(Category).order_by(Category.name)).all()
    data = [
        CategoryRead(
            id=category.id,
            name=category.name,
            slug=category.slug,
            color=category.color,
            icon=category.icon,
        )
        for category in categories
    ]
    return ApiResponse(success=True, data=data)


@router.post(
    "/categories",
    response_model=ApiResponse[CategoryRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
):
    slug = payload.slug or slugify(payload.name)
    if not slug:
        raise AppError(
            code="CATEGORY_SLUG_INVALID",
            message="カテゴリ名から slug を生成できません",
            status_code=400,
        )

    duplicate_slug = db.scalar(select(Category).where(Category.slug == slug).limit(1))
    if duplicate_slug is not None:
        raise AppError(
            code="CATEGORY_SLUG_ALREADY_EXISTS",
            message="同じ slug のカテゴリが既に存在します",
            status_code=409,
        )

    duplicate_name = db.scalar(select(Category).where(Category.name == payload.name).limit(1))
    if duplicate_name is not None:
        raise AppError(
            code="CATEGORY_NAME_ALREADY_EXISTS",
            message="同じ name のカテゴリが既に存在します",
            status_code=409,
        )

    category = Category(
        name=payload.name,
        slug=slug,
        color=payload.color,
        icon=payload.icon,
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return ApiResponse(
        success=True,
        data=CategoryRead(
            id=category.id,
            name=category.name,
            slug=category.slug,
            color=category.color,
            icon=category.icon,
        ),
    )
