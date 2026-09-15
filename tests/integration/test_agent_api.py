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


@pytest.mark.asyncio
async def test_chat_rate_limiting_enforcement():
    from packages.domain.agent.rate_limiter import get_rate_limiter
    limiter = get_rate_limiter()
    limiter.reset()
    original_max = limiter.max_requests
    limiter.max_requests = 2  # Set limit to 2 for quick testing

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Request 1: allowed
            r1 = await client.post("/api/agent/chat", json={"message": "What is our energy usage?"})
            assert r1.status_code == 200
            assert r1.headers.get("X-RateLimit-Remaining") == "1"

            # Request 2: allowed
            r2 = await client.post("/api/agent/chat", json={"message": "What is our carbon footprint?"})
            assert r2.status_code == 200
            assert r2.headers.get("X-RateLimit-Remaining") == "0"

            # Request 3: blocked with 429
            r3 = await client.post("/api/agent/chat", json={"message": "Spam query to exhaust limit"})
            assert r3.status_code == 429
            err_data = r3.json()
            assert "Rate limit exceeded" in err_data["detail"]
            assert "Retry-After" in r3.headers
            assert int(r3.headers["Retry-After"]) > 0
    finally:
        limiter.max_requests = original_max
        limiter.reset()

