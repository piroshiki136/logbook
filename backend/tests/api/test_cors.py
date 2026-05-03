import pytest

pytestmark = pytest.mark.anyio


async def test_cors_preflight_allows_expected_method_and_headers(client):
    res = await client.options(
        "/api/articles",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Authorization, Content-Type, Accept",
        },
    )

    assert res.status_code == 200
    assert res.headers["access-control-allow-methods"] == "GET, POST, PATCH, DELETE"
    assert res.headers["access-control-allow-headers"] == (
        "Accept, Accept-Language, Authorization, Content-Language, Content-Type"
    )


async def test_cors_preflight_rejects_unexpected_method(client):
    res = await client.options(
        "/api/articles",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "PUT",
        },
    )

    assert res.status_code == 400
