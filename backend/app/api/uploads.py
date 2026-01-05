from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.response import ApiResponse
from app.core.security import require_admin
from app.schemas.upload import UploadImageResponse
from app.services import uploads as upload_service

router = APIRouter()


@router.post(
    "/upload-image",
    response_model=ApiResponse[UploadImageResponse],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def upload_image(
    file: UploadFile = File(...),
):
    return upload_service.save_article_image(file=file)
