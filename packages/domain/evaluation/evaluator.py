"""Evaluation runner for TerraOps.

Runs deterministic benchmark test cases and calculates actual measured metrics
(ingestion accuracy, retrieval hit@k, citation presence, refusal behavior,
forecasting error, and latency percentiles).
"""
import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
from pydantic import BaseModel

from apps.api.state import app_state
from packages.domain.agent.assistant import AssistantEngine
from packages.domain.agent.provider import NoLLMProvider
from packages.domain.agent.schemas import ChatRequest
from packages.domain.analytics.anomaly import AnomalyDetector
from packages.domain.analytics.forecasting import TimeSeriesForecaster
from packages.domain.rag.retriever import LocalKnowledgeRetriever


class BenchmarkMetric(BaseModel):
    name: str
    measured_value: float
    target_threshold: float
    passed: bool
    unit: str
    details: str


class EvaluationReport(BaseModel):
    timestamp: str
    total_test_cases: int
    passed_cases: int
    metrics: List[BenchmarkMetric]
    latency_p50_ms: float
    latency_p95_ms: float
    overall_status: str  # "PASSED" or "FAILED"


class BenchmarkEvaluator:
    """Executes deterministic benchmark evaluations and compiles empirical metric scores."""

    def __init__(self, benchmark_file: Optional[Path] = None):
        self.benchmark_path = benchmark_file or (
            Path(__file__).resolve().parent.parent.parent.parent
            / "data"
            / "benchmarks"
            / "benchmark_cases.json"
        )
        self.retriever = LocalKnowledgeRetriever()
        self.assistant = AssistantEngine(provider=NoLLMProvider())
        self.forecaster = TimeSeriesForecaster(min_history_required=6)
        self.anomaly_detector = AnomalyDetector(z_threshold=2.5)

    async def run_evaluation(self) -> EvaluationReport:
        """Run all benchmark test cases and return measured evaluation metrics."""
        records = app_state.get_or_load_records()

        # Load benchmark cases
        with open(self.benchmark_path, "r", encoding="utf-8") as f:
            suite = json.load(f)
        cases = suite.get("cases", [])

        latencies: List[float] = []
        metrics: List[BenchmarkMetric] = []
        passed_cases = 0

        # 1. Ingestion Correctness
        ingest_result = app_state.load_demo_data()
        total_rows = ingest_result.summary.total_rows
        valid_rows = ingest_result.summary.valid_rows
        ingest_acc = (valid_rows / total_rows * 100.0) if total_rows > 0 else 0.0
        metrics.append(BenchmarkMetric(
            name="Ingestion Accuracy",
            measured_value=round(ingest_acc, 1),
            target_threshold=95.0,
            passed=ingest_acc >= 95.0,
            unit="%",
            details=f"{valid_rows}/{total_rows} records validated successfully.",
        ))

        # 2. RAG Retrieval Hit@3 and Refusal Accuracy
        rag_hits = 0
        rag_total = 0
        citation_present_count = 0
        refusal_correct = 0
        refusal_total = 0

        for tc in [c for c in cases if c.get("category") == "rag"]:
            t0 = time.perf_counter()
            query = tc["query"]
            res = self.retriever.retrieve(query=query, top_k=3)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            latencies.append(elapsed_ms)

            expected_sources = tc.get("expected_sources", [])
            must_cite = tc.get("must_contain_citation", False)
            expected_refusal = tc.get("expected_insufficient_evidence", False)

            if must_cite:
                rag_total += 1
                retrieved_sources = [c.source_id for c in res.citations]
                if any(src in retrieved_sources for src in expected_sources):
                    rag_hits += 1
                if len(res.citations) > 0 and not res.insufficient_evidence:
                    citation_present_count += 1
                    passed_cases += 1
            elif expected_refusal:
                refusal_total += 1
                if res.insufficient_evidence:
                    refusal_correct += 1
                    passed_cases += 1

        hit_rate = (rag_hits / rag_total * 100.0) if rag_total > 0 else 100.0
        metrics.append(BenchmarkMetric(
            name="Retrieval Hit@3",
            measured_value=round(hit_rate, 1),
            target_threshold=80.0,
            passed=hit_rate >= 80.0,
            unit="%",
            details=f"{rag_hits}/{rag_total} on-topic queries retrieved ground-truth source.",
        ))

        citation_rate = (citation_present_count / rag_total * 100.0) if rag_total > 0 else 100.0
        metrics.append(BenchmarkMetric(
            name="Citation Presence",
            measured_value=round(citation_rate, 1),
            target_threshold=90.0,
            passed=citation_rate >= 90.0,
            unit="%",
            details=f"{citation_present_count}/{rag_total} citations present with verified metadata.",
        ))

        refusal_rate = (refusal_correct / refusal_total * 100.0) if refusal_total > 0 else 100.0
        metrics.append(BenchmarkMetric(
            name="Refusal / Guardrail Correctness",
            measured_value=round(refusal_rate, 1),
            target_threshold=100.0,
            passed=refusal_rate >= 100.0,
            unit="%",
            details="Off-topic queries correctly trigger insufficient-evidence warnings.",
        ))

        # 3. Agent Tool Calling & Question Answering
        agent_cases = [c for c in cases if c.get("category") == "agent"]
        agent_correct = 0

        for tc in agent_cases:
            t0 = time.perf_counter()
            chat_req = ChatRequest(message=tc["message"])
            try:
                res = await self.assistant.answer(chat_req)
            except Exception:
                res = None

            elapsed_ms = (time.perf_counter() - t0) * 1000
            latencies.append(elapsed_ms)

            if res:
                executed_tools = [t.tool_name for t in res.tools_used]
                expected_tools = tc.get("expected_tools", [])
                if any(tool in executed_tools for tool in expected_tools):
                    keywords = tc.get("must_contain_keywords", [])
                    if all(k.lower() in res.answer.lower() for k in keywords):
                        agent_correct += 1
                        passed_cases += 1

        agent_acc = (agent_correct / len(agent_cases) * 100.0) if agent_cases else 100.0
        metrics.append(BenchmarkMetric(
            name="Agent Tool Dispatch & Faithfulness",
            measured_value=round(agent_acc, 1),
            target_threshold=90.0,
            passed=agent_acc >= 90.0,
            unit="%",
            details=f"{agent_correct}/{len(agent_cases)} agent answers grounded in executed tools.",
        ))

        # 4. Forecast Baseline Error (Backtested MAE)
        fc_cases = [c for c in cases if c.get("category") == "forecast"]
        for tc in fc_cases:
            t0 = time.perf_counter()
            fc_report = self.forecaster.forecast(records, horizon=tc["horizon"])
            elapsed_ms = (time.perf_counter() - t0) * 1000
            latencies.append(elapsed_ms)

            mape = fc_report.model_metrics.get("mape", 10.0)
            passed = (
                fc_report.status == "success"
                and len(fc_report.points) == tc["horizon"]
                and mape <= tc["max_acceptable_mape"]
                and all(p.predicted_energy_kwh >= 0 for p in fc_report.points)
            )
            if passed:
                passed_cases += 1

            metrics.append(BenchmarkMetric(
                name="Forecasting Baseline Error (MAPE)",
                measured_value=round(mape, 2),
                target_threshold=tc["max_acceptable_mape"],
                passed=passed,
                unit="%",
                details=f"Backtested Mean Absolute Percentage Error: {mape:.2f}%.",
            ))

        # 5. Anomaly Detection
        anom_cases = [c for c in cases if c.get("category") == "anomaly"]
        for tc in anom_cases:
            t0 = time.perf_counter()
            anom_report = self.anomaly_detector.detect_zscore(records)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            latencies.append(elapsed_ms)

            detected = anom_report.anomalies_detected
            passed = detected >= tc["min_expected_anomalies"]
            if passed:
                passed_cases += 1

            metrics.append(BenchmarkMetric(
                name="Anomaly Detection Sensitivity",
                measured_value=float(detected),
                target_threshold=float(tc["min_expected_anomalies"]),
                passed=passed,
                unit="points",
                details=f"Detected {detected} anomalous intervals (threshold z={anom_report.threshold}).",
            ))

        # Latency calculations
        p50 = float(np.percentile(latencies, 50)) if latencies else 0.0
        p95 = float(np.percentile(latencies, 95)) if latencies else 0.0

        all_passed = all(m.passed for m in metrics)

        return EvaluationReport(
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            total_test_cases=len(cases),
            passed_cases=passed_cases,
            metrics=metrics,
            latency_p50_ms=round(p50, 2),
            latency_p95_ms=round(p95, 2),
            overall_status="PASSED" if all_passed else "FAILED",
        )
