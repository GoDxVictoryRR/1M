import pytest
from httpx import ASGITransport, AsyncClient
from apps.api.main import app
from apps.api.state import app_state


@pytest.fixture(autouse=True)
def setup_demo_data():
    app_state.load_demo_data()


@pytest.mark.asyncio
async def test_get_agent_tools_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/agent/tools")
        assert response.status_code == 200
        tools = response.json()
        assert len(tools) == 6
        names = {t["name"] for t in tools}
        assert "get_metrics" in names
        assert "search_knowledge" in names
        assert "rank_interventions" in names
        assert "estimate_impact" in names


@pytest.mark.asyncio
async def test_direct_tool_execution_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/agent/tool/estimate_impact",
            json={"arguments": {"reduction_percent": 20.0, "resource_type": "compute"}},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["tool_name"] == "estimate_impact"
        assert data["success"] is True
        assert data["output"]["reduction_percent"] == 20.0
        assert data["output"]["estimated_energy_savings_kwh"] > 0


@pytest.mark.asyncio
async def test_direct_tool_execution_unauthorized_tool():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/agent/tool/run_shell_script",
            json={"arguments": {}},
        )
        assert response.status_code == 400
        data = response.json()
        assert "Unauthorized tool" in data["detail"]


@pytest.mark.asyncio
async def test_direct_tool_execution_invalid_arguments():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/agent/tool/estimate_impact",
            json={"arguments": {"reduction_percent": 150.0}},
        )
        assert response.status_code == 400
        data = response.json()
        assert "Invalid arguments" in data["detail"]


@pytest.mark.asyncio
async def test_chat_with_assistant_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/agent/chat",
            json={"message": "What should we fix first to reduce emissions?"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert len(data["tools_used"]) > 0
        assert "assumptions" in data
        assert "fallback_mode" in data


@pytest.mark.asyncio
async def test_check_provider_health_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/agent/provider/health")
        assert response.status_code == 200
        data = response.json()
        assert "provider" in data
        assert "model" in data
        assert "status" in data
