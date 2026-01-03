from __future__ import annotations

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


def save_article_image(*, file: UploadFile) -> ApiResponse[UploadImageResponse]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise AppError(
            code="REQUEST_FAILED",
            message="画像ファイルを指定してください",
            status_code=400,
        )

    now = _now()
    target_dir = UPLOAD_ROOT / "articles" / now.strftime("%Y") / now.strftime("%m")
    target_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "").suffix
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


def _now() -> datetime:
    return datetime.now(UTC)
