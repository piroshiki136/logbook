from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.response import ApiResponse
from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryRead

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
