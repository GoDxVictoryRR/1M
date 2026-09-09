# TerraOps Phase 8 Empirical Benchmark & Quality Evaluation Report

- **Report Timestamp**: 2026-09-09T20:42:41Z
- **Benchmark Suite**: `data/benchmarks/benchmark_cases.json` (v1.0.0)
- **Execution Mode**: 100% Deterministic Offline (Zero-Cost, No Paid APIs)
- **Overall Status**: **PASSED** (8/8 benchmark cases passed, 7/7 metrics passed)

---

## 1. Quality & Accuracy Metrics

| Metric | Measured Value | Target Threshold | Status | Unit | Operational Context / Validation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Ingestion Accuracy** | **100.0%** | $\ge 95.0\%$ | ✅ PASSED | % | 24/24 records ingested, validated, and normalized without loss. |
| **Retrieval Hit@3** | **100.0%** | $\ge 80.0\%$ | ✅ PASSED | % | 2/2 domain queries retrieved expected authoritative source chunks. |
| **Citation Presence** | **100.0%** | $\ge 90.0\%$ | ✅ PASSED | % | 2/2 retrieved chunks contain verified publisher, source URL, date, and section metadata. |
| **Refusal / Guardrail Correctness** | **100.0%** | $100.0\%$ | ✅ PASSED | % | Off-topic query ("baking sourdough bread") triggered strict `insufficient_evidence=True`. |
| **Agent Tool Dispatch & Faithfulness** | **100.0%** | $\ge 90.0\%$ | ✅ PASSED | % | 3/3 queries dispatched correct allowlisted tools (`rank_interventions`, `estimate_impact`, `get_metrics`). |
| **Forecasting Baseline Error (MAPE)** | **10.00%** | $\le 25.0\%$ | ✅ PASSED | % | Backtested Mean Absolute Percentage Error on telemetry baseline. |
| **Anomaly Detection Sensitivity** | **4** | $\ge 1$ | ✅ PASSED | points | Correctly flagged 4 statistical energy surge outliers ($z \ge 2.5$). |

---

## 2. Latency & Performance Profile

- **P50 Operational Latency**: `0.78 ms`
- **P95 Operational Latency**: `1.40 ms`
- **Machine Profile**: Local Windows x86_64 host, Python 3.12 runtime, asynchronous non-blocking event loop.
- **Cost**: ₹0.00 / $0.00 (Zero paid APIs, zero cloud subscriptions).

---

## 3. Groundedness & Anti-Hallucination Audit

1. **Tool Output Confinement**: The assistant policy strictly binds numerical generation to the compact JSON outputs returned by executed allowlisted tools.
2. **Untrusted Data Boundary**: User inputs and retrieved knowledge chunks are quarantined as untrusted content, preventing prompt injection from escalating tool privileges.
3. **Graceful Degradation Verification**: When Ollama server is offline or times out, the assistant switches to `NoLLMProvider` deterministic template mode with 0% unhandled exceptions.
