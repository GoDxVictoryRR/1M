"""Integration tests for Evaluation API endpoints."""
import pytest
from httpx import ASGITransport, AsyncClient
from apps.api.main import app
from apps.api.state import app_state


@pytest.fixture(autouse=True)
def setup_demo_data():
    app_state.load_demo_data()


@pytest.mark.asyncio
async def test_evaluation_run_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/evaluation/run")
        assert response.status_code == 200
        data = response.json()
        assert data["overall_status"] == "PASSED"
        assert len(data["metrics"]) >= 7
        assert data["latency_p50_ms"] >= 0


@pytest.mark.asyncio
async def test_evaluation_latest_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/evaluation/latest")
        assert response.status_code == 200
        data = response.json()
        assert data["overall_status"] == "PASSED"
