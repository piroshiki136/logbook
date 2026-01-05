import pytest

pytestmark = pytest.mark.anyio


async def test_health(client):
    res = await client.get("/api/health")
    assert res.status_code == 200
