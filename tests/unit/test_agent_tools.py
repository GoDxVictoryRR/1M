import pytest
from apps.api.state import app_state
from packages.domain.agent.tools import ToolExecutionError, ToolRegistry, get_tool_registry


@pytest.fixture(autouse=True)
def setup_demo_data():
    app_state.load_demo_data()


def test_tool_allowlist_contains_only_approved_tools():
    registry = get_tool_registry()
    tools = registry.list_tools()
    tool_names = {t.name for t in tools}

    expected_allowlist = {
        "get_metrics",
        "get_anomalies",
        "get_forecast",
        "search_knowledge",
        "estimate_impact",
        "rank_interventions",
    }
    assert tool_names == expected_allowlist

    # Ensure every tool is explicitly marked read_only
    for t in tools:
        assert t.read_only is True


def test_unauthorized_tool_is_rejected():
    registry = get_tool_registry()
    unauthorized_tools = [
        "mutate_cluster",
        "execute_shell",
        "drop_database",
        "modify_infrastructure",
        "eval",
    ]
    for bad_tool in unauthorized_tools:
        with pytest.raises(ToolExecutionError) as exc_info:
            registry.execute(bad_tool, {})
        assert "Unauthorized tool" in str(exc_info.value)


def test_execute_get_metrics_tool():
    registry = get_tool_registry()
    res = registry.execute("get_metrics", {})
    assert res.success is True
    assert res.tool_name == "get_metrics"
    assert "energy" in res.output
    assert "emissions" in res.output
    assert res.output["energy"]["total_energy_kwh"]["value"] > 0


def test_execute_get_metrics_rejects_extra_arguments():
    registry = get_tool_registry()
    with pytest.raises(ToolExecutionError) as exc_info:
        registry.execute("get_metrics", {"unwanted_param": 123})
    assert "Invalid arguments" in str(exc_info.value)


def test_execute_get_anomalies_tool():
    registry = get_tool_registry()
    res = registry.execute("get_anomalies", {"method": "rolling_zscore"})
    assert res.success is True
    assert "anomalies_detected" in res.output


def test_execute_get_anomalies_rejects_invalid_method():
    registry = get_tool_registry()
    with pytest.raises(ToolExecutionError):
        registry.execute("get_anomalies", {"method": "unsupported_ml_method"})


def test_execute_get_forecast_tool():
    registry = get_tool_registry()
    res = registry.execute("get_forecast", {"horizon_intervals": 4})
    assert res.success is True
    assert res.output["horizon_intervals"] == 4
    assert len(res.output["points"]) == 4


def test_execute_get_forecast_rejects_out_of_bounds_horizon():
    registry = get_tool_registry()
    with pytest.raises(ToolExecutionError):
        registry.execute("get_forecast", {"horizon_intervals": 100})  # max is 48

    with pytest.raises(ToolExecutionError):
        registry.execute("get_forecast", {"horizon_intervals": 0})  # min is 1


def test_execute_search_knowledge_tool():
    registry = get_tool_registry()
    res = registry.execute("search_knowledge", {"query": "rightsizing compute instances", "top_k": 2})
    assert res.success is True
    assert "citations" in res.output
    assert len(res.output["citations"]) > 0


def test_execute_search_knowledge_rejects_empty_query():
    registry = get_tool_registry()
    with pytest.raises(ToolExecutionError):
        registry.execute("search_knowledge", {"query": "a"})  # min_length is 2


def test_execute_estimate_impact_tool():
    registry = get_tool_registry()
    res = registry.execute("estimate_impact", {"reduction_percent": 10.0, "resource_type": "compute"})
    assert res.success is True
    assert res.output["reduction_percent"] == 10.0
    assert res.output["estimated_energy_savings_kwh"] > 0
    assert res.output["estimated_emissions_savings_kgco2e"] > 0


def test_execute_estimate_impact_rejects_out_of_range_percentage():
    registry = get_tool_registry()
    with pytest.raises(ToolExecutionError):
        registry.execute("estimate_impact", {"reduction_percent": 150.0})  # max 100.0

    with pytest.raises(ToolExecutionError):
        registry.execute("estimate_impact", {"reduction_percent": -5.0})  # min 0.0


def test_execute_rank_interventions_tool():
    registry = get_tool_registry()
    res = registry.execute("rank_interventions", {})
    assert res.success is True
    assert "interventions" in res.output
    assert res.output["total_interventions"] > 0
