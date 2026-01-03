from __future__ import annotations

import os
import shutil
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.exceptions import AppError
from app.core.response import ApiResponse
from app.core.settings import get_settings
from app.schemas.upload import UploadImageResponse

settings = get_settings()


def _resolve_upload_root() -> Path:
    root = Path(settings.upload_root).expanduser()
    if not root.is_absolute():
        root = Path(__file__).resolve().parents[2] / root
    return root


UPLOAD_ROOT = _resolve_upload_root()
UPLOAD_IMAGE_MAX_BYTES = settings.upload_image_max_bytes
ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def save_article_image(*, file: UploadFile) -> ApiResponse[UploadImageResponse]:
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise AppError(
            code="REQUEST_FAILED",
            message="許可されていない画像形式です",
            status_code=400,
        )

    _ensure_file_size(file=file, max_bytes=UPLOAD_IMAGE_MAX_BYTES)

    now = _now()
    target_dir = UPLOAD_ROOT / "articles" / now.strftime("%Y") / now.strftime("%m")
    target_dir.mkdir(parents=True, exist_ok=True)

    suffix = ALLOWED_IMAGE_TYPES[file.content_type]
    filename = f"{uuid4().hex}{suffix}"
    target_path = target_dir / filename

    with target_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    url = _build_asset_url(f"articles/{now.strftime('%Y')}/{now.strftime('%m')}/{filename}")

    return ApiResponse(
        success=True,
        data=UploadImageResponse(url=url),
    )


def _build_asset_url(path: str) -> str:
    base = settings.asset_base_url.rstrip("/")
    return f"{base}/{path.lstrip('/')}"


def _ensure_file_size(*, file: UploadFile, max_bytes: int) -> None:
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    if size > max_bytes:
        raise AppError(
            code="REQUEST_FAILED",
            message="画像ファイルのサイズが上限を超えています",
            status_code=413,
        )


def _now() -> datetime:
    return datetime.now(UTC)
