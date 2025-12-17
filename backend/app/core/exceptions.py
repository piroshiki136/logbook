import logging

from app.core.response import ApiResponse
from app.core.settings import get_settings
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)
settings = get_settings()

PUBLIC_STATUS_CODES = {
    400,  # Bad Request（仕様違反）
    401,  # Unauthorized
    403,  # Forbidden
    404,  # Not Found
}


def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTPException を統一レスポンス形式で返す。"""
    if settings.debug or exc.status_code in PUBLIC_STATUS_CODES:
        message = exc.detail
    else:
        message = "Request failed"

    return JSONResponse(
        status_code=exc.status_code,
        content=ApiResponse(
            success=False,
            message=message,
        ).model_dump(),
    )


def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """未処理例外を 500 エラーとして返す。"""
    logger.exception("Unhandled exception", exc_info=exc)

    return JSONResponse(
        status_code=500,
        content=ApiResponse(
            success=False,
            message="Internal Server Error",
        ).model_dump(),
    )


def setup_exception_handlers(app: FastAPI) -> None:
    """FastAPI アプリケーションに例外ハンドラを設定する。"""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
