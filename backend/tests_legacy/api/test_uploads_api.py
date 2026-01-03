from pathlib import Path

from fastapi import status

from app.core.security import require_admin
from app.core.settings import get_settings
from app.main import app
from app.services import uploads as upload_service


def _set_override(dep, value):
    app.dependency_overrides[dep] = value


def _clear_override(dep):
    app.dependency_overrides.pop(dep, None)


def test_upload_image_requires_auth(client):
    res = client.post("/api/upload-image", files={"file": ("test.png", b"data", "image/png")})
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_upload_image_succeeds_for_admin(client, tmp_path, monkeypatch):
    _set_override(require_admin, lambda: {"email": "test@example.com"})
    monkeypatch.setattr(upload_service, "UPLOAD_ROOT", tmp_path)

    settings = get_settings()
    original_base_url = settings.asset_base_url
    settings.asset_base_url = "http://example.com/uploads"

    try:
        res = client.post(
            "/api/upload-image",
            files={"file": ("test.png", b"data", "image/png")},
        )
    finally:
        settings.asset_base_url = original_base_url
        _clear_override(require_admin)

    assert res.status_code == status.HTTP_201_CREATED
    payload = res.json()
    assert payload["success"] is True
    url = payload["data"]["url"]
    assert url.startswith("http://example.com/uploads/")

    relative_path = url.replace("http://example.com/uploads/", "")
    target_path = Path(tmp_path) / relative_path
    assert target_path.exists()
