import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app

@pytest.mark.asyncio
async def test_get_recommendations_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Load demo dataset first
        await client.post("/api/data/demo")

        response = await client.get("/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        assert data["total_interventions"] >= 2
        assert data["potential_energy_savings_kwh"] > 0
        assert len(data["items"]) >= 2

        first = data["items"][0]
        assert "id" in first
        assert "title" in first
        assert "overall_score" in first
        assert "impact_score" in first
        assert "confidence_score" in first
        assert "effort" in first
        assert "suggested_action" in first
        assert "provenance" in first

@pytest.mark.asyncio
async def test_get_recommendation_by_id_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/api/data/demo")

        # Get list first
        list_resp = await client.get("/api/recommendations")
        assert list_resp.status_code == 200
        first_id = list_resp.json()["items"][0]["id"]

        # Get specific
        detail_resp = await client.get(f"/api/recommendations/{first_id}")
        assert detail_resp.status_code == 200
        rec = detail_resp.json()
        assert rec["id"] == first_id

@pytest.mark.asyncio
async def test_get_nonexistent_recommendation_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/api/data/demo")
        response = await client.get("/api/recommendations/REC-NOTFOUND-999")
        assert response.status_code == 404
