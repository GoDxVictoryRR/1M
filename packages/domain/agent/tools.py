"""Tool execution sandbox and allowlist for TerraOps Agent.

Enforces strictly read-only execution, schema validation, and rejects
any unknown tools or unauthorized parameters.
"""
import time
from typing import Any, Callable, Dict, List, Optional
from pydantic import ValidationError

from packages.domain.agent.schemas import (
    EstimateImpactArgs,
    GetAnomaliesArgs,
    GetForecastArgs,
    GetMetricsArgs,
    RankInterventionsArgs,
    SearchKnowledgeArgs,
    ToolCallRecord,
    ToolSchema,
)
from apps.api.state import app_state
from packages.domain.analytics.anomaly import AnomalyDetector
from packages.domain.analytics.forecasting import TimeSeriesForecaster
from packages.domain.rag.retriever import LocalKnowledgeRetriever
from packages.domain.recommendations.engine import RecommendationEngine


# Tool schemas exposed to LLM and API consumers
ALLOWLISTED_TOOLS: Dict[str, ToolSchema] = {
    "get_metrics": ToolSchema(
        name="get_metrics",
        description="Retrieve deterministic energy (kWh/MWh), Scope 2 emissions (kgCO2e/tCO2e), and utilization statistics.",
        parameters={
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        },
        read_only=True,
    ),
    "get_anomalies": ToolSchema(
        name="get_anomalies",
        description="Detect consumption anomalies using explainable rolling z-score or Isolation Forest.",
        parameters={
            "type": "object",
            "properties": {
                "method": {
                    "type": "string",
                    "enum": ["rolling_zscore", "isolation_forest"],
                    "default": "rolling_zscore",
                    "description": "Detection method algorithm",
                }
            },
            "additionalProperties": False,
        },
        read_only=True,
    ),
    "get_forecast": ToolSchema(
        name="get_forecast",
        description="Generate baseline near-term energy forecast with 95% confidence intervals.",
        parameters={
            "type": "object",
            "properties": {
                "horizon_intervals": {
                    "type": "integer",
                    "default": 6,
                    "minimum": 1,
                    "maximum": 48,
                    "description": "Number of future intervals to forecast",
                }
            },
            "additionalProperties": False,
        },
        read_only=True,
    ),
    "search_knowledge": ToolSchema(
        name="search_knowledge",
        description="Search offline verified sustainability knowledge base and standards (Scope 2, rightsizing, cooling).",
        parameters={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query or operational topic",
                },
                "top_k": {
                    "type": "integer",
                    "default": 3,
                    "minimum": 1,
                    "maximum": 10,
                    "description": "Number of citations to retrieve",
                },
            },
            "required": ["query"],
            "additionalProperties": False,
        },
        read_only=True,
    ),
    "estimate_impact": ToolSchema(
        name="estimate_impact",
        description="Simulate energy and emissions impact of reducing runtime or load by a given percentage.",
        parameters={
            "type": "object",
            "properties": {
                "reduction_percent": {
                    "type": "number",
                    "minimum": 0.0,
                    "maximum": 100.0,
                    "description": "Reduction percentage (e.g. 10.0 for 10%)",
                },
                "resource_type": {
                    "type": "string",
                    "description": "Optional resource type filter (e.g. 'compute')",
                },
            },
            "required": ["reduction_percent"],
            "additionalProperties": False,
        },
        read_only=True,
    ),
    "rank_interventions": ToolSchema(
        name="rank_interventions",
        description="Retrieve rule-based prioritized sustainability recommendations scored by transparent formula.",
        parameters={
            "type": "object",
            "properties": {},
            "additionalProperties": False,
        },
        read_only=True,
    ),
}


class ToolExecutionError(Exception):
    """Raised when a tool is not allowed or arguments are invalid."""
    pass


class ToolRegistry:
    """Sandbox registry enforcing tool allowlisting and deterministic execution."""

    def __init__(self):
        self._schemas = ALLOWLISTED_TOOLS

    def list_tools(self) -> List[ToolSchema]:
        """Return list of all allowlisted tool schemas."""
        return list(self._schemas.values())

    def get_tool_schema(self, tool_name: str) -> Optional[ToolSchema]:
        return self._schemas.get(tool_name)

    def is_allowed(self, tool_name: str) -> bool:
        return tool_name in self._schemas

    def execute(self, tool_name: str, arguments: Optional[Dict[str, Any]] = None) -> ToolCallRecord:
        """Execute an allowlisted tool with strict argument validation and timing."""
        start_time = time.perf_counter()
        args = arguments or {}

        # 1. Gate: Verify tool is in allowlist
        if not self.is_allowed(tool_name):
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            raise ToolExecutionError(
                f"Unauthorized tool '{tool_name}'. Allowed tools: {list(self._schemas.keys())}"
            )

        # 2. Gate: Validate arguments against strict Pydantic model
        validated_args, error_msg = self._validate_args(tool_name, args)
        if error_msg:
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            raise ToolExecutionError(f"Invalid arguments for tool '{tool_name}': {error_msg}")

        # 3. Execute tool deterministically
        try:
            output = self._dispatch(tool_name, validated_args)
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            return ToolCallRecord(
                tool_name=tool_name,
                arguments=args,
                output=output,
                execution_time_ms=round(elapsed_ms, 2),
                success=True,
            )
        except Exception as exc:
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            return ToolCallRecord(
                tool_name=tool_name,
                arguments=args,
                output={"error": str(exc)},
                execution_time_ms=round(elapsed_ms, 2),
                success=False,
                error_message=str(exc),
            )

    def _validate_args(self, tool_name: str, args: Dict[str, Any]) -> tuple[Dict[str, Any], Optional[str]]:
        """Validate input arguments using Pydantic models with extra='forbid'."""
        try:
            if tool_name == "get_metrics":
                model = GetMetricsArgs(**args)
                return model.model_dump(), None
            elif tool_name == "get_anomalies":
                model = GetAnomaliesArgs(**args)
                return model.model_dump(), None
            elif tool_name == "get_forecast":
                model = GetForecastArgs(**args)
                return model.model_dump(), None
            elif tool_name == "search_knowledge":
                model = SearchKnowledgeArgs(**args)
                return model.model_dump(), None
            elif tool_name == "estimate_impact":
                model = EstimateImpactArgs(**args)
                return model.model_dump(), None
            elif tool_name == "rank_interventions":
                model = RankInterventionsArgs(**args)
                return model.model_dump(), None
            else:
                return {}, f"Unknown tool '{tool_name}'"
        except ValidationError as e:
            return {}, str(e)

    def _dispatch(self, tool_name: str, validated_args: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch execution to the appropriate domain service."""
        records = app_state.get_or_load_records()

        if tool_name == "get_metrics":
            summary = app_state.metrics_calc.calculate(records)
            return summary.model_dump()

        elif tool_name == "get_anomalies":
            method = validated_args.get("method", "rolling_zscore")
            detector = AnomalyDetector(z_threshold=2.5)
            if method == "isolation_forest":
                report = detector.detect_isolation_forest(records)
            else:
                report = detector.detect_zscore(records)
            return {
                "total_records": report.total_records_analyzed,
                "anomalies_detected": report.anomalies_detected,
                "method": report.method,
                "items": [item.model_dump() for item in report.items[:5]],  # Compact top 5
            }

        elif tool_name == "get_forecast":
            horizon = validated_args.get("horizon_intervals", 6)
            forecaster = TimeSeriesForecaster(min_history_required=6)
            report = forecaster.forecast(records, horizon=horizon)
            return {
                "status": report.status,
                "method": report.method,
                "historical_points": report.historical_points,
                "horizon_intervals": report.horizon_intervals,
                "points": [p.model_dump() for p in report.points],
                "model_metrics": report.model_metrics,
            }

        elif tool_name == "search_knowledge":
            query = validated_args["query"]
            top_k = validated_args.get("top_k", 3)
            retriever = LocalKnowledgeRetriever()
            retrieval_res = retriever.retrieve(query=query, top_k=top_k)
            return {
                "query": retrieval_res.query,
                "insufficient_evidence": retrieval_res.insufficient_evidence,
                "warning": retrieval_res.warning,
                "citations": [
                    {
                        "chunk_id": c.chunk_id,
                        "title": c.title,
                        "publisher": c.publisher,
                        "section_title": c.section_title,
                        "content": c.content[:300],
                        "similarity_score": c.similarity_score,
                    }
                    for c in retrieval_res.citations
                ],
            }

        elif tool_name == "estimate_impact":
            reduction_pct = validated_args["reduction_percent"]
            res_type = validated_args.get("resource_type")

            # Filter records if resource_type is provided
            target_records = [r for r in records if r.resource_type == res_type] if res_type else records
            baseline_summary = app_state.metrics_calc.calculate(target_records)

            base_energy = baseline_summary.energy.total_energy_kwh.value
            base_emissions = baseline_summary.emissions.total_emissions_kgco2e.value

            saved_energy = round(base_energy * (reduction_pct / 100.0), 2)
            saved_emissions = round(base_emissions * (reduction_pct / 100.0), 2)
            new_energy = round(base_energy - saved_energy, 2)
            new_emissions = round(base_emissions - saved_emissions, 2)

            return {
                "reduction_percent": reduction_pct,
                "target_resource_type": res_type or "all",
                "baseline_energy_kwh": base_energy,
                "baseline_emissions_kgco2e": base_emissions,
                "estimated_energy_savings_kwh": saved_energy,
                "estimated_emissions_savings_kgco2e": saved_emissions,
                "projected_energy_kwh": new_energy,
                "projected_emissions_kgco2e": new_emissions,
                "calculation_version": "v1.0-deterministic-simulation",
            }

        elif tool_name == "rank_interventions":
            engine = RecommendationEngine(app_state.factor_repo)
            dq_score = 0.95
            if app_state.summary and app_state.summary.total_rows > 0:
                dq_score = app_state.summary.valid_rows / app_state.summary.total_rows
            rec_report = engine.generate_recommendations(records, data_quality_score=dq_score)
            return {
                "total_interventions": rec_report.total_interventions,
                "potential_energy_savings_kwh": rec_report.potential_energy_savings_kwh,
                "potential_emissions_reduction_kgco2e": rec_report.potential_emissions_reduction_kgco2e,
                "interventions": [
                    {
                        "id": item.id,
                        "title": item.title,
                        "category": item.category,
                        "overall_score": item.overall_score,
                        "estimated_energy_savings_kwh": item.estimated_energy_savings_kwh,
                        "estimated_emissions_reduction_kgco2e": item.estimated_emissions_reduction_kgco2e,
                        "suggested_action": item.suggested_action,
                    }
                    for item in rec_report.items
                ],
            }

        raise ToolExecutionError(f"Unhandled tool dispatch for '{tool_name}'")


# Global singleton instance
_registry = ToolRegistry()


def get_tool_registry() -> ToolRegistry:
    return _registry
