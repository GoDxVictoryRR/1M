import pytest
from unittest.mock import AsyncMock
from apps.api.state import app_state
from packages.domain.agent.assistant import AssistantEngine
from packages.domain.agent.provider import NoLLMProvider, OllamaProvider, ProviderHealth, ProviderResponse
from packages.domain.agent.schemas import ChatRequest


@pytest.fixture(autouse=True)
def setup_demo_data():
    app_state.load_demo_data()


def test_tool_selection_for_recommendations():
    assistant = AssistantEngine()
    tools = assistant.select_tools_for_query("What should we fix first to reduce our footprint?")
    tool_names = [t[0] for t in tools]
    assert "rank_interventions" in tool_names


def test_tool_selection_for_simulation():
    assistant = AssistantEngine()
    tools = assistant.select_tools_for_query("What would happen if we reduced compute runtime by 15%?")
    tool_names = [t[0] for t in tools]
    assert "estimate_impact" in tool_names

    # Check argument extraction
    impact_tool = next(t for t in tools if t[0] == "estimate_impact")
    assert impact_tool[1]["reduction_percent"] == 15.0
    assert impact_tool[1]["resource_type"] == "compute"


def test_tool_selection_for_knowledge_and_standards():
    assistant = AssistantEngine()
    tools = assistant.select_tools_for_query("What does GHG Protocol Scope 2 guidance say about location-based accounting?")
    tool_names = [t[0] for t in tools]
    assert "search_knowledge" in tool_names


def test_tool_selection_for_anomalies():
    assistant = AssistantEngine()
    tools = assistant.select_tools_for_query("Did we have any power consumption anomalies or spikes?")
    tool_names = [t[0] for t in tools]
    assert "get_anomalies" in tool_names


@pytest.mark.asyncio
async def test_no_llm_fallback_mode_generates_grounded_answer():
    assistant = AssistantEngine(provider=NoLLMProvider())
    req = ChatRequest(message="What should we fix first?")
    res = await assistant.answer(req)

    assert res.fallback_mode is True
    assert res.model_used == "deterministic-template"
    assert len(res.tools_used) > 0
    assert any(t.tool_name == "rank_interventions" for t in res.tools_used)
    assert "Operational Decision-Support Summary" in res.answer
    assert "kWh" in res.answer
    assert len(res.assumptions) > 0


@pytest.mark.asyncio
async def test_assistant_simulation_with_no_llm_fallback():
    assistant = AssistantEngine(provider=NoLLMProvider())
    req = ChatRequest(message="What would happen if we reduced runtime by 10%?")
    res = await assistant.answer(req)

    assert res.fallback_mode is True
    assert any(t.tool_name == "estimate_impact" for t in res.tools_used)
    assert "Impact Simulation (10.0% Reduction)" in res.answer
    assert "Projected energy savings" in res.answer


@pytest.mark.asyncio
async def test_assistant_knowledge_query_extracts_citations():
    assistant = AssistantEngine(provider=NoLLMProvider())
    req = ChatRequest(message="What evidence supports compute rightsizing best practices?")
    res = await assistant.answer(req)

    assert any(t.tool_name == "search_knowledge" for t in res.tools_used)
    assert len(res.citations) > 0
    assert res.citations[0]["title"] is not None


@pytest.mark.asyncio
async def test_ollama_provider_graceful_fallback_when_offline():
    # Configure Ollama provider pointing to a non-existent port
    offline_provider = OllamaProvider(base_url="http://127.0.0.1:99999", timeout_seconds=0.5)
    assistant = AssistantEngine(provider=offline_provider)

    req = ChatRequest(message="What are our current emissions metrics?")
    res = await assistant.answer(req)

    # Must not crash; must fall back to deterministic response
    assert res.fallback_mode is True
    assert "Scope 2 Emissions" in res.answer


@pytest.mark.asyncio
async def test_ollama_provider_generation_when_healthy():
    # Mock healthy Ollama provider
    mock_provider = AsyncMock(spec=OllamaProvider)
    mock_provider.health_check.return_value = ProviderHealth(
        provider="ollama",
        model="qwen3.5:4b",
        status="healthy",
    )
    mock_provider.generate.return_value = ProviderResponse(
        content="Based on the analysis, right-sizing underutilized instances will save 3,840 kWh.",
        model="qwen3.5:4b",
        provider="ollama",
        fallback_used=False,
    )

    assistant = AssistantEngine(provider=mock_provider)
    req = ChatRequest(message="What should we fix first?")
    res = await assistant.answer(req)

    assert res.fallback_mode is False
    assert res.model_used == "qwen3.5:4b"
    assert "right-sizing" in res.answer.lower()
    assert len(res.tools_used) > 0
