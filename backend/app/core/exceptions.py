import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse

from app.core.settings import get_settings
from app.schemas.error import ErrorResponse

logger = logging.getLogger(__name__)
settings = get_settings()

PUBLIC_STATUS_CODES = {
    400,  # Bad Request（仕様違反）
    401,  # Unauthorized
    403,  # Forbidden
    404,  # Not Found
}


class AppError(Exception):
    def __init__(self, *, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _build_error_body(detail: Any, status_code: int) -> tuple[str, str]:
    if isinstance(detail, dict):
        code = str(detail.get("code", "REQUEST_FAILED"))
        message = str(detail.get("message", "Request failed"))
    else:
        code = "REQUEST_FAILED"
        message = str(detail)

    if not settings.debug and status_code not in PUBLIC_STATUS_CODES:
        message = "Request failed"

    return code, message


def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTPException を統一レスポンス形式で返す。"""
    code, message = _build_error_body(exc.detail, exc.status_code)

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error={
                "code": code,
                "message": message,
            },
        ).model_dump(),
    )


def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """AppError を統一レスポンス形式で返す。"""
    code, message = _build_error_body(
        {"code": exc.code, "message": exc.message},
        exc.status_code,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error={
                "code": code,
                "message": message,
            },
        ).model_dump(),
    )


def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """未処理例外を 500 エラーとして返す。"""
    logger.exception("Unhandled exception", exc_info=exc)

    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error={
                "code": "INTERNAL_SERVER_ERROR",
                "message": "現在エラーが発生しています",
            },
        ).model_dump(),
    )


def _validation_error_message(exc: RequestValidationError) -> str:
    if not settings.debug:
        return "入力内容が正しくありません"
    errors = exc.errors()
    if not errors:
        return "入力内容が正しくありません"
    messages: list[str] = []
    for error in errors:
        msg = error.get("msg")
        if msg:
            messages.append(str(msg))
    if not messages:
        return "入力内容が正しくありません"
    joined = "; ".join(messages)
    return f"入力内容が正しくありません: {joined}"


def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """RequestValidationError を統一レスポンス形式で返す。"""
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error={
                "code": "REQUEST_VALIDATION_ERROR",
                "message": _validation_error_message(exc),
            },
        ).model_dump(),
    )


def setup_exception_handlers(app: FastAPI) -> None:
    """FastAPI アプリケーションに例外ハンドラを設定する。"""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
