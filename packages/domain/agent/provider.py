"""Local model provider adapter for TerraOps Agent.

Decouples the application from any proprietary or third-party SDKs.
Provides an asynchronous interface to local Ollama with timeout, friendly error
mapping, and a deterministic No-LLM fallback mode.
"""
import os
import json
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel


class ProviderHealth(BaseModel):
    provider: str
    model: str
    status: str  # "healthy", "offline", "degraded"
    details: Optional[str] = None


class ProviderResponse(BaseModel):
    content: str
    model: str
    provider: str
    fallback_used: bool = False
    tokens_used: Optional[int] = None


class LLMProvider(ABC):
    """Abstract interface for local language model providers."""

    @abstractmethod
    async def health_check(self) -> ProviderHealth:
        pass

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context_data: Optional[Dict[str, Any]] = None,
        max_tokens: int = 512,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        pass


class OllamaProvider(LLMProvider):
    """Local Ollama adapter communicating over standard HTTP."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
    ):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen3.5:4b")
        self.timeout = timeout_seconds

    async def health_check(self) -> ProviderHealth:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    has_target = any(self.model in m for m in models)
                    return ProviderHealth(
                        provider="ollama",
                        model=self.model,
                        status="healthy" if has_target else "model_missing",
                        details=f"Installed models: {', '.join(models) if models else 'None'}",
                    )
                return ProviderHealth(
                    provider="ollama",
                    model=self.model,
                    status="degraded",
                    details=f"HTTP {res.status_code}",
                )
        except Exception as exc:
            return ProviderHealth(
                provider="ollama",
                model=self.model,
                status="offline",
                details=f"Cannot connect to local Ollama server ({exc})",
            )

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context_data: Optional[Dict[str, Any]] = None,
        max_tokens: int = 512,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        # Context budgeting: cap total prompt length safely
        capped_prompt = prompt[:3000]
        full_system = system_prompt or "You are TerraOps sustainability assistant. Rely only on verified evidence."

        if context_data:
            capped_prompt += f"\n\nContext:\n{json.dumps(context_data, indent=2)[:2000]}"

        payload = {
            "model": self.model,
            "prompt": capped_prompt,
            "system": full_system,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "").strip()
                    eval_count = data.get("eval_count")
                    return ProviderResponse(
                        content=response_text,
                        model=self.model,
                        provider="ollama",
                        fallback_used=False,
                        tokens_used=eval_count,
                    )
                else:
                    raise RuntimeError(f"Ollama returned HTTP {res.status_code}: {res.text}")
        except Exception as exc:
            # On timeout or network failure, fall back to NoLLMProvider gracefully
            fallback = NoLLMProvider()
            res = await fallback.generate(prompt=prompt, system_prompt=system_prompt, context_data=context_data)
            res.fallback_used = True
            return res


class NoLLMProvider(LLMProvider):
    """Deterministic, zero-cost template provider for offline / fallback operation."""

    async def health_check(self) -> ProviderHealth:
        return ProviderHealth(
            provider="no-llm-fallback",
            model="deterministic-template",
            status="healthy",
            details="Always available; 100% offline and deterministic.",
        )

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context_data: Optional[Dict[str, Any]] = None,
        max_tokens: int = 512,
        temperature: float = 0.2,
    ) -> ProviderResponse:
        # Generate structured, deterministic answer based on tool outputs & context
        p_lower = prompt.lower()
        lines: List[str] = []

        if not context_data or not context_data.get("tools_executed"):
            lines.append("I evaluated your query against current operational data.")
            lines.append("No specific tool execution was necessary or no telemetry records were available.")
        else:
            tools = context_data.get("tools_executed", [])
            lines.append("### Operational Decision-Support Summary")
            lines.append(f"Analyzed query using {len(tools)} verified deterministic tool(s):")

            for t in tools:
                name = t.get("tool_name")
                out = t.get("output", {})

                if name == "rank_interventions":
                    items = out.get("interventions", [])
                    pot_kwh = out.get("potential_energy_savings_kwh", 0)
                    pot_co2 = out.get("potential_emissions_reduction_kgco2e", 0)
                    lines.append(f"\n**Priority Interventions (Identified {len(items)} actions):**")
                    lines.append(f"- Estimated cumulative potential energy savings: **{pot_kwh:,.1f} kWh**")
                    lines.append(f"- Estimated emissions reduction: **{pot_co2:,.1f} kgCO2e**")
                    for idx, item in enumerate(items[:3], 1):
                        lines.append(
                            f"{idx}. **{item.get('title')}** (Score: {item.get('overall_score')}) — "
                            f"{item.get('suggested_action')}"
                        )

                elif name == "get_metrics":
                    energy_val = out.get("energy", {}).get("total_energy_kwh", {}).get("value", 0)
                    emiss_val = out.get("emissions", {}).get("total_emissions_kgco2e", {}).get("value", 0)
                    mean_util = out.get("utilization", {}).get("mean_utilization", {}).get("value", 0)
                    lines.append("\n**Current Telemetry Metrics:**")
                    lines.append(f"- Total Energy: **{energy_val:,.1f} kWh**")
                    lines.append(f"- Scope 2 Emissions: **{emiss_val:,.1f} kgCO2e**")
                    lines.append(f"- Mean Resource Utilization: **{mean_util * 100:.1f}%**")

                elif name == "estimate_impact":
                    pct = out.get("reduction_percent", 0)
                    sav_kwh = out.get("estimated_energy_savings_kwh", 0)
                    sav_co2 = out.get("estimated_emissions_savings_kgco2e", 0)
                    lines.append(f"\n**Impact Simulation ({pct}% Reduction):**")
                    lines.append(f"- Projected energy savings: **{sav_kwh:,.1f} kWh**")
                    lines.append(f"- Projected emissions reduction: **{sav_co2:,.1f} kgCO2e**")

                elif name == "search_knowledge":
                    citations = out.get("citations", [])
                    insufficient = out.get("insufficient_evidence", False)
                    if insufficient:
                        lines.append("\n**Evidence Retrieval:**")
                        lines.append("⚠️ Local knowledge base contains insufficient authoritative evidence on this specific query.")
                    elif citations:
                        lines.append(f"\n**Evidence Grounding ({len(citations)} citation(s)):**")
                        for c in citations[:2]:
                            lines.append(f"- *{c.get('title')}* ({c.get('publisher')}): {c.get('content', '')[:160]}...")

                elif name == "get_anomalies":
                    anom_count = out.get("anomalies_detected", 0)
                    method = out.get("method", "rolling_zscore")
                    lines.append(f"\n**Anomaly Detection:** {anom_count} anomaly points detected using `{method}`.")

                elif name == "get_forecast":
                    pts = out.get("points", [])
                    lines.append(f"\n**Energy Forecast:** Projected next {len(pts)} intervals with 95% confidence intervals.")

        lines.append("\n*(Note: Generated via TerraOps Deterministic Decision Support Engine)*")

        return ProviderResponse(
            content="\n".join(lines),
            model="deterministic-template",
            provider="no-llm-fallback",
            fallback_used=True,
        )
