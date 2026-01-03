from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.response import ApiResponse
from app.db.session import get_db
from app.models.tag import Tag
from app.schemas.tag import TagRead

router = APIRouter()


@router.get(
    "/tags",
    response_model=ApiResponse[list[TagRead]],
)
def list_tags(
    db: Session = Depends(get_db),
):
    tags = db.scalars(select(Tag).order_by(Tag.name)).all()
    data = [TagRead(id=tag.id, name=tag.name, slug=tag.slug) for tag in tags]
    return ApiResponse(success=True, data=data)
