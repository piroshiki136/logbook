from app.core.security import is_admin_user
from app.core.settings import get_settings


def test_admin_allowed_emails_are_normalized_to_lowercase(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(
        settings,
        "admin_allowed_emails_raw",
        " Admin@Example.com,Second@Example.com ",
    )

    assert settings.admin_allowed_emails == [
        "admin@example.com",
        "second@example.com",
    ]


def test_is_admin_user_allows_case_insensitive_email(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(
        settings,
        "admin_allowed_emails_raw",
        "Admin@Example.com",
    )

    assert is_admin_user({"email": "admin@example.com"}) is True
    assert is_admin_user({"email": "ADMIN@example.com"}) is True
