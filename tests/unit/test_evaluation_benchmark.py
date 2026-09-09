"""Unit tests verifying Phase 8 Evaluation benchmark execution and metrics."""
import pytest
from apps.api.state import app_state
from packages.domain.evaluation.evaluator import BenchmarkEvaluator


@pytest.fixture(autouse=True)
def setup_demo_data():
    app_state.load_demo_data()


@pytest.mark.asyncio
async def test_benchmark_evaluator_runs_and_passes():
    evaluator = BenchmarkEvaluator()
    report = await evaluator.run_evaluation()

    assert report.total_test_cases > 0
    assert report.passed_cases > 0
    assert report.overall_status == "PASSED"
    assert report.latency_p50_ms >= 0
    assert report.latency_p95_ms >= report.latency_p50_ms

    # Check individual metrics
    metric_names = {m.name for m in report.metrics}
    assert "Ingestion Accuracy" in metric_names
    assert "Retrieval Hit@3" in metric_names
    assert "Citation Presence" in metric_names
    assert "Refusal / Guardrail Correctness" in metric_names
    assert "Agent Tool Dispatch & Faithfulness" in metric_names
    assert "Forecasting Baseline Error (MAPE)" in metric_names
    assert "Anomaly Detection Sensitivity" in metric_names

    # Assert every metric passed its target threshold
    for metric in report.metrics:
        assert metric.passed is True, f"Metric '{metric.name}' failed: measured {metric.measured_value} vs target {metric.target_threshold}"
