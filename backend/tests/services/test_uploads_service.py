from io import BytesIO
from pathlib import Path

import pytest
from starlette.datastructures import Headers, UploadFile

from app.core.exceptions import AppError
from app.services import uploads as upload_service


def _make_upload_file(filename: str, content_type: str) -> UploadFile:
    headers = Headers({"content-type": content_type})
    return UploadFile(filename=filename, file=BytesIO(b"test"), headers=headers)


def test_upload_rejects_non_image_content_type():
    upload = _make_upload_file("note.txt", "text/plain")

    with pytest.raises(AppError) as exc:
        upload_service.save_article_image(file=upload)

    assert exc.value.code == "REQUEST_FAILED"
    assert exc.value.status_code == 400


def test_upload_saves_file_and_returns_url(tmp_path, monkeypatch):
    upload = _make_upload_file("image.png", "image/png")

    monkeypatch.setattr(upload_service, "UPLOAD_ROOT", tmp_path)
    original_base_url = upload_service.settings.asset_base_url
    upload_service.settings.asset_base_url = "http://example.com/uploads"

    try:
        response = upload_service.save_article_image(file=upload)
    finally:
        upload_service.settings.asset_base_url = original_base_url

    assert response.data is not None
    assert response.data.url.startswith("http://example.com/uploads/")

    relative_path = response.data.url.replace("http://example.com/uploads/", "")
    target_path = Path(tmp_path) / relative_path
    assert target_path.exists()
