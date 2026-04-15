from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.response import ApiResponse
from app.core.security import require_admin
from app.db.session import get_db
from app.models.tag import Tag
from app.schemas.tag import TagRead, TagUpdate

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


@router.patch(
    "/tags/{tag_id}",
    response_model=ApiResponse[TagRead],
    dependencies=[Depends(require_admin)],
)
def update_tag(
    tag_id: int,
    payload: TagUpdate,
    db: Session = Depends(get_db),
):
    tag = db.get(Tag, tag_id)
    if tag is None:
        raise AppError(
            code="TAG_NOT_FOUND",
            message="タグが見つかりません",
            status_code=404,
        )

    duplicate = db.scalar(select(Tag).where(Tag.name == payload.name, Tag.id != tag_id).limit(1))
    if duplicate is not None:
        raise AppError(
            code="TAG_NAME_ALREADY_EXISTS",
            message="同じ name のタグが既に存在します",
            status_code=409,
        )

    tag.name = payload.name
    db.commit()
    db.refresh(tag)

    return ApiResponse(
        success=True,
        data=TagRead(id=tag.id, name=tag.name, slug=tag.slug),
    )
