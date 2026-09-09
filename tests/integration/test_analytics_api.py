import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app

@pytest.mark.asyncio
async def test_analytics_anomalies_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Load demo dataset first
        await client.post("/api/data/demo")

        response = await client.get("/api/analytics/anomalies")
        assert response.status_code == 200
        data = response.json()
        assert data["method"] == "rolling_zscore"
        assert data["total_records_analyzed"] == 24
        assert data["anomalies_detected"] >= 1
        assert len(data["items"]) >= 1

        first = data["items"][0]
        assert "resource_id" in first
        assert "anomaly_score" in first
        assert "severity" in first
        assert "explanation" in first

@pytest.mark.asyncio
async def test_analytics_isolation_forest_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/api/data/demo")

        response = await client.get("/api/analytics/anomalies?method=isolation_forest")
        assert response.status_code == 200
        data = response.json()
        assert data["method"] == "isolation_forest"
        assert data["total_records_analyzed"] == 24

@pytest.mark.asyncio
async def test_analytics_forecast_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/api/data/demo")

        response = await client.get("/api/analytics/forecast?horizon=6")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["horizon_intervals"] == 6
        assert len(data["points"]) == 6
        assert "predicted_energy_kwh" in data["points"][0]
        assert "lower_bound" in data["points"][0]
        assert "upper_bound" in data["points"][0]
        assert "model_metrics" in data
