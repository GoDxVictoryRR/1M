import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app

@pytest.mark.asyncio
async def test_load_demo_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/data/demo")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["summary"]["total_rows"] == 24
        assert data["summary"]["total_energy_kwh"] > 0

@pytest.mark.asyncio
async def test_get_data_summary_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Load demo first
        await client.post("/api/data/demo")
        
        response = await client.get("/api/data/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["unique_resources"] >= 1

@pytest.mark.asyncio
async def test_metrics_summary_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Ensure data is loaded
        await client.post("/api/data/demo")
        
        response = await client.get("/api/metrics/summary")
        assert response.status_code == 200
        metrics = response.json()
        assert "energy" in metrics
        assert "emissions" in metrics
        assert "utilization" in metrics
        assert metrics["energy"]["total_energy_kwh"]["value"] > 0
        assert metrics["emissions"]["total_emissions_kgco2e"]["value"] > 0
        assert len(metrics["emissions"]["factors_applied"]) > 0

@pytest.mark.asyncio
async def test_emission_factors_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/metrics/factors")
        assert response.status_code == 200
        factors = response.json()
        assert len(factors) >= 4
        ids = [f["factor_id"] for f in factors]
        assert "us-epa-egrid-rfce-2024" in ids

@pytest.mark.asyncio
async def test_upload_raw_csv_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        csv_payload = (
            "timestamp,resource_id,resource_type,utilization,energy_kwh,region\n"
            "2026-03-01T00:00:00Z,srv-upload-1,compute,0.55,14.5,us-east\n"
            "2026-03-01T01:00:00Z,srv-upload-1,compute,0.65,18.2,us-east\n"
        )
        response = await client.post(
            "/api/data/upload",
            content=csv_payload,
            headers={"Content-Type": "text/plain"}
        )
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["status"] == "success"
        assert res_data["summary"]["valid_rows"] == 2
        assert res_data["summary"]["total_energy_kwh"] == 32.7
