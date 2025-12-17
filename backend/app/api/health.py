from app.core.response import ApiResponse
from app.schemas.health import HealthData
from fastapi import APIRouter

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
