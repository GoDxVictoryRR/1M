# TerraOps Agent State

## Project Status
- **Current Status**: Active — Phase 7 (UI Dashboard Integration & Export) Completed Successfully
- **Target Goal**: Build TerraOps sustainability decision-support product (SDG 13 Climate Action) adhering to zero-cost, local-first architecture.

## Current Phase
- **Phase 7 — UI** (Completed)
- **Next Phase**: Phase 8 — Evaluation (Fixed Benchmark Dataset, Metric Measurement, and Verification Artifacts)

## Completed Work
- **Phase 0 — Inspect & Environment Assessment**:
  - Validated instructions and environment runtimes.
  - Confirmed zero-cost architecture baseline.
  - Authored `docs/technical-assessment.md` and initial `docs/agent-state.md`.
- **Phase 1 — Bootstrap**:
  - Created `.env.example`, `README.md`, `pyproject.toml`, and `docker-compose.yml`.
  - Built `apps/api` skeleton with `/health` and CORS.
  - Built `apps/web` Vite + React 18 + TS frontend shell.
  - Set up test harness and verified initial unit tests.
- **Phase 2 — Data + Metrics**:
  - Created versioned emission factor registry in `data/factors/emission_factors.json` with EPA eGRID and EEA factors.
  - Built `packages/domain/factors/repository.py` with regional lookups.
  - Built streaming/batch ingestion validator in `packages/domain/ingestion/validator.py`.
  - Implemented deterministic metrics calculator in `packages/domain/metrics/calculator.py`.
  - Built API endpoints `apps/api/routers/data.py` and `apps/api/routers/metrics.py`.
- **Phase 3 — Analytics**:
  - Built explainable anomaly detector in `packages/domain/analytics/anomaly.py` (rolling z-score and Isolation Forest).
  - Built baseline time-series forecaster in `packages/domain/analytics/forecasting.py` with 95% confidence intervals and backtested error metrics.
  - Added API endpoints in `apps/api/routers/analytics.py`.
- **Phase 4 — Recommendations**:
  - Implemented deterministic rule templates for compute rightsizing, scheduling, and power remediation.
  - Transparent mathematical scoring formula with auditable provenance.
  - Added API endpoints `GET /api/recommendations` and `GET /api/recommendations/{id}`.
- **Phase 5 — RAG (Knowledge Base & Evidence Retrieval)**:
  - Curated authoritative sustainability operational docs in `data/knowledge/` (Scope 2 guidance, rightsizing, off-peak scheduling, cooling & PUE efficiency).
  - Built section-aware Markdown parser and chunker preserving metadata.
  - Built offline, zero-cost vectorless hybrid TF-IDF + keyword/tag retriever (`packages/domain/rag/retriever.py`) with cosine similarity and stem-based query term coverage.
  - Strict insufficient-evidence guardrail: triggers warning when similarity < threshold or query term coverage < 35%.
  - Added API endpoints `GET /api/rag/search` and `GET /api/rag/documents`.
- **Phase 6 — Agent + Local LLM (Decision-Support Assistant)**:
  - Implemented strictly read-only tool sandbox (`packages/domain/agent/tools.py`) enforcing allowlist of 6 safe tools: `get_metrics`, `get_anomalies`, `get_forecast`, `search_knowledge`, `estimate_impact`, `rank_interventions`.
  - Strict argument validation rejecting unknown tools or out-of-bounds parameters with Pydantic models.
  - Built provider adapter (`packages/domain/agent/provider.py`) with asynchronous Ollama integration (`qwen3.5:4b`) over standard HTTP and deterministic `NoLLMProvider` fallback mode.
  - Implemented conversational assistant engine (`packages/domain/agent/assistant.py`) with intent-based tool dispatch, prompt-injection defense, and citation grounding.
  - Created API endpoints `GET /api/agent/tools`, `POST /api/agent/tool/{tool_name}`, `POST /api/agent/chat`, and `GET /api/agent/provider/health`.
  - Integrated interactive conversational assistant panel and tool inspection into frontend dashboard.
  - Verified 72 automated unit and integration tests passing.
- **Phase 7 — UI (Incremental Complete Dashboard Integration)**:
  - Integrated all 8 views into cohesive tabbed navigation: Overview, KPIs & Trends, Anomalies & Forecast, Recommendations, RAG Knowledge & Citations, Decision Assistant, and Audit & Environment.
  - Implemented PDF/HTML-friendly Report Export (`window.print` with print-specific stylesheet hiding interactive buttons/inputs and rendering an auditable document).
  - Validated clean TypeScript build.

## Pending Work
- **Phase 8 — Evaluation**: Benchmark dataset and verification metrics.
- **Phase 9 — Hardening**: Security audit and comprehensive test suite pass.
- **Phase 10 — Demo Packaging**: Documentation, demo dataset, and one-command local startup.

## Decisions Made
1. **Zero-LLM Recommendation & Calculation Gate**: All calculations, impacts, anomaly scores, and rankings remain 100% deterministic code.
2. **Safe Read-Only Sandbox**: Assistant tools cannot mutate infrastructure or run arbitrary commands; unknown tools and unauthorized arguments are strictly rejected with 400 Bad Request.
3. **Graceful Degradation**: Offline / No-LLM fallback mode works 100% reliably when Ollama is offline.

## Commands Used
- `uv run --extra dev pytest -v` (72 passed in 22s)
- `cd apps/web && npm run build` (Passed cleanly in 953ms, 0 errors)
- `git commit -m "..." && git push origin main`

## Test Status
- Automated tests: 72 passed, 0 failed.
- Frontend build: Passed cleanly.

## Next Action
- Commit Phase 6 to GitHub and proceed to Phase 7 (UI Dashboard Integration).
