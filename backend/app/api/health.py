from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.response import ApiResponse
from app.db.session import get_db
from app.schemas.health import HealthData

router = APIRouter()


@router.get(
    "/health",
    response_model=ApiResponse[HealthData],
)
def health_check():
    return ApiResponse(
        success=True,
        data=HealthData(status="ok"),
    )


@router.get(
    "/health/db",
    response_model=ApiResponse[HealthData],
)
def health_check_db(db: Session = Depends(get_db)):  # noqa: B008
    # 実際に DB に触る（これが重要）
    db.execute(text("SELECT 1"))

    return ApiResponse(
        success=True,
        data=HealthData(status="ok"),
    )
