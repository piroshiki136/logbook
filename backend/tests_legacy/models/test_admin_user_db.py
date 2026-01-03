# admin_users モデルの挿入とユニーク制約を確認するテスト
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import AdminUser


def test_admin_user_insert_and_unique_email(db_session):
    admin = AdminUser(
        email="admin@example.com",
        provider="google",
        provider_id="google-123",
        name="Admin",
    )
    db_session.add(admin)
    db_session.flush()

    saved = db_session.execute(
        select(AdminUser).where(AdminUser.email == "admin@example.com")
    ).scalar_one()
    assert saved.provider_id == "google-123"

    duplicate_email = AdminUser(
        email="admin@example.com",
        provider="google",
        provider_id="google-456",
        name="Another",
    )
    db_session.add(duplicate_email)
    with pytest.raises(IntegrityError):
        db_session.flush()


def test_admin_user_unique_provider_id(db_session):
    admin = AdminUser(
        email="admin@example.com",
        provider="google",
        provider_id="google-123",
        name="Admin",
    )
    db_session.add(admin)
    db_session.flush()

    duplicate_provider = AdminUser(
        email="admin2@example.com",
        provider="google",
        provider_id="google-123",
        name="Another",
    )
    db_session.add(duplicate_provider)
    with pytest.raises(IntegrityError):
        db_session.flush()
