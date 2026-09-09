# TerraOps: Operational Sustainability Decision-Support System

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero-Cost Architecture](https://img.shields.io/badge/cost-₹0%20mandatory-brightgreen.svg)]()
[![SDG 13: Climate Action](https://img.shields.io/badge/UN%20SDG-13%20Climate%20Action-orange.svg)](https://sdgs.un.org/goals/goal13)

TerraOps is an open-source, local-first operational sustainability decision-support platform designed to convert cloud, data center, and IT telemetry into prioritized, auditable environmental action plans. Aligned with **UN Sustainable Development Goal 13 (Climate Action)**, TerraOps enables organizations to track energy and carbon footprints, detect anomalies, forecast resource needs, and simulate interventions with mathematical transparency.

---

## Zero-Cost Architectural Philosophy

TerraOps is engineered to run **100% locally with zero billable cloud services and zero external API dependencies**:
1. **Deterministic Foundations**: Carbon metrics (GHG Protocol Scope 2), anomaly detection, forecasting, and recommendation rankings are computed using deterministic algorithms and authoritative regional factor registries (EPA eGRID 2024, EEA 2024).
2. **Offline Hybrid RAG**: Vectorless hybrid TF-IDF and keyword retrieval against authoritative environmental standards with strict insufficient-evidence guardrails.
3. **Sandboxed Read-Only Agent**: Allows natural language queries and intervention simulation with zero destructive capabilities.
4. **Resilient AI Ingestion**: Connects optionally to local [Ollama](https://ollama.ai) (`qwen3.5:4b`), automatically failing over to an offline deterministic template provider whenever Ollama is offline or unreachable.

---

## Architecture

```text
+-------------------------------------------------------------------------+
|                              TerraOps UI                                |
|           (React 18 + TypeScript + Vite + Tailwind/Modern CSS)           |
|   [Overview] [KPIs & Trends] [Anomalies & Forecast] [Recommendations]   |
|         [Evidence & RAG] [Decision Assistant] [Evaluation & Audit]      |
+------------------------------------+------------------------------------+
                                     | REST (JSON / Multipart)
+------------------------------------v------------------------------------+
|                         FastAPI Backend (Port 8000)                     |
|                                                                         |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Ingestion Engine  |  | Metrics Calculator |  | Analytics Engine   |  |
|  | CSV + Schema Val  |  | Scope 2 / Energy   |  | Z-Score + IForest  |  |
|  +---------+---------+  +---------+----------+  | Baseline Forecast  |  |
|            |                      |             +---------+----------+  |
|            v                      v                       |             |
|  +-------------------+  +--------------------+            |             |
|  | Factor Registry   |  | Recommendation     |<-----------+             |
|  | EPA / EEA factors |  | Rule Engine        |                          |
|  +-------------------+  +---------+----------+                          |
|                                   |                                     |
|  +--------------------------------v----------------------------------+  |
|  |               Read-Only Sandboxed Agent Layer                    |  |
|  |  Tools: get_metrics, get_anomalies, get_forecast, rank_actions  |  |
|  |  Offline RAG Retriever (Authoritative GHG & Efficiency Docs)      |  |
|  +--------------------------------+----------------------------------+  |
|                                   |                                     |
|                     +-------------v-------------+                       |
|                     | AI Inference Provider     |                       |
|                     | - Ollama (Local LLM)      |                       |
|                     | - Offline Fallback Engine |                       |
|                     +---------------------------+                       |
+-------------------------------------------------------------------------+
```

---

## Features & Capabilities

- **Deterministic GHG Scope 2 & Energy Accounting**: Location-based emissions computed across regional electricity grids (`US-EAST`, `US-WEST`, `EU-CENTRAL`, `AP-SOUTH`, etc.).
- **Dual Anomaly Detection**:
  - **Rolling Z-Score**: Real-time statistical spike detection with configurable deviation thresholds.
  - **Isolation Forest**: Multi-dimensional unsupervised outlier detection across energy, CPU, and memory utilization.
- **Explainable Time-Series Forecasting**: Baseline rolling trend extrapolation with 95% confidence intervals and automated backtested error metrics (MAE, RMSE, MAPE).
- **Rule-Based Recommendation Engine**: Transparent mathematical ranking ($S = 0.40 \cdot C + 0.35 \cdot K + 0.15 \cdot F - 0.10 \cdot E$) for idle compute rightsizing, off-peak scheduling, and PUE remediation with full provenance citations.
- **Authoritative Hybrid RAG Retrieval**: Cites GHG Protocol Scope 2 Guidance, ASHRAE thermal guidelines, and cloud right-sizing playbooks with query-term coverage guardrails.
- **Strict Security & Hardening**:
  - 10MB upload payload limits and `.csv` extension verification.
  - Path traversal protection on filenames.
  - Read-only agent sandbox preventing arbitrary execution or destructive commands.
  - Hardened CORS and zero plaintext secrets.
- **Empirical Evaluation Suite**: Automated benchmark framework measuring ingestion accuracy, retrieval Hit@k, citation presence, and execution latency.

---

## Quickstart

### Option A: One-Command Startup with Docker Compose

Run both API and frontend containers with a single command:

```bash
docker compose up --build
```

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **API Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option B: Local Bare-Metal Development

#### 1. Environment Configuration

```bash
cp .env.example .env
```

#### 2. Backend Setup (Python 3.11+)

Using `uv` (recommended):
```bash
uv sync --extra dev
uv run uvicorn apps.api.main:app --reload --port 8000
```

Or using standard Python virtual environment:
```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -e ".[dev]"
uvicorn apps.api.main:app --reload --port 8000
```

#### 3. Frontend Setup (Node 18+)

```bash
cd apps/web
npm install
npm run dev
```

Dashboard is accessible at `http://localhost:5173`.

---

## Verification & Test Suite

TerraOps includes an extensive test suite covering ingestion validation, regional emission lookups, anomaly detectors, forecasters, rule recommendations, sandboxed agent tools, hybrid RAG, and security hardening:

```bash
# Run all unit, integration, and security tests (82 tests)
uv run --extra dev pytest -v

# Run frontend build & type check
cd apps/web && npm run build
```

---

## Empirical Benchmark Results (Phase 8)

The system was evaluated against `data/benchmarks/benchmark_cases.json` using `packages/domain/evaluation/evaluator.py`:

| Evaluation Dimension | Benchmark Metric | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Ingestion Accuracy** | Valid records parsed cleanly | **100.0%** (24/24 rows) | PASS |
| **Retrieval Quality** | Hit@3 on authoritative RAG queries | **100.0%** | PASS |
| **Citation Grounding** | Grounded citation presence | **100.0%** | PASS |
| **Refusal Correctness** | Out-of-domain prompt refusal rate | **100.0%** | PASS |
| **Agent Tool Faithfulness**| Correct tool execution rate | **100.0%** | PASS |
| **Forecast Baseline Error** | Mean Absolute Percentage Error (MAPE) | **10.0%** | PASS |
| **Execution Latency** | Median tool runtime (p50) | **0.78 ms** | PASS |

Full details and logs are recorded in [`docs/evaluation-report.md`](docs/evaluation-report.md).

---

## Demo Walkthrough Guide

1. **Open Dashboard**: Navigate to `http://localhost:5173`.
2. **Load Telemetry**:
   - Click **"Load 24h Demo Telemetry"** on the Overview tab, or upload your own operational CSV.
   - Review immediate calculation of Total Energy (kWh), Total Emissions (kgCO2e), Average Carbon Intensity, and Mean CPU Utilization.
3. **Analyze Trends & Outliers**:
   - Switch to **"Anomalies & Forecast"** tab.
   - Toggle between **Rolling Z-Score** and **Isolation Forest** algorithms.
   - Inspect the 6-hour baseline forecast with 95% confidence bands.
4. **Evaluate Recommendations**:
   - Switch to **"Recommendations"** tab.
   - Review prioritized remediation items with estimated monthly carbon savings, cost savings, and transparent formula scores.
5. **Inspect Evidence**:
   - Switch to **"Evidence & Citations"** tab.
   - Query sustainability guidance (e.g. `Scope 2 location-based accounting` or `server right-sizing idle thresholds`).
6. **Interact with Decision Assistant**:
   - Switch to **"Decision Assistant"** tab.
   - Ask: *"What actions can reduce our emissions?"* or *"Simulate a 20% compute reduction"*.
   - Notice strictly audited read-only tool execution badges and grounded source citations.
7. **Export Audit Report**:
   - Switch to **"Evaluation & Audit"** tab.
   - Click **"Print / Export PDF Audit Report"** to generate an executive compliance summary.

---

## Contributing & License

TerraOps is open-source under the MIT License. Contributions aligned with UN SDG 13 and sustainable engineering practices are welcome!

