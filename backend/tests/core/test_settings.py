from app.core.settings import Settings


def build_settings(**overrides):
    base = {
        "DATABASE_URL": "sqlite+pysqlite:///./test.db",
        "JWT_PUBLIC_KEY": "dummy-public-key",
        "ADMIN_ALLOWED_EMAILS": "admin@example.com",
    }
    base.update(overrides)
    return Settings(**base)


def test_cors_allow_origins_accepts_single_origin_string():
    settings = build_settings(
        CORS_ALLOW_ORIGINS="https://example.com",
    )

    assert settings.cors_allow_origins == ["https://example.com"]


def test_cors_allow_origins_accepts_comma_separated_origins():
    settings = build_settings(
        CORS_ALLOW_ORIGINS="https://example.com, http://localhost:3000",
    )

    assert settings.cors_allow_origins == [
        "https://example.com",
        "http://localhost:3000",
    ]


def test_cors_allow_origins_ignores_blank_entries():
    settings = build_settings(
        CORS_ALLOW_ORIGINS="https://example.com, , http://localhost:3000 ",
    )

    assert settings.cors_allow_origins == [
        "https://example.com",
        "http://localhost:3000",
    ]
