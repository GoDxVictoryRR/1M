# TerraOps Agent State

## Project Status
- **Current Status**: Active — Phase 4 (Recommendations Engine) Completed Successfully
- **Target Goal**: Build TerraOps sustainability decision-support product (SDG 13 Climate Action) adhering to zero-cost, local-first architecture.

## Current Phase
- **Phase 4 — Recommendations** (Completed)
- **Next Phase**: Phase 5 — RAG (Local Knowledge Base, Document Parser/Chunker, Local Embeddings, and Source-Aware Vector Retrieval)

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
  - Implemented deterministic rule templates:
    1. Right-size underutilized compute instances (mean utilization < 50%, peak < 70%).
    2. Off-peak scheduling / idle power-down (22:00–06:00 low utilization).
    3. Remediate anomalous power spikes (severity critical/high).
  - Transparent mathematical scoring:
    `overall_score = (impact * 0.45) + (confidence * 25) + ((1 - effort) * 20) + (data_quality * 10)`
  - Added API endpoints `GET /api/recommendations` and `GET /api/recommendations/{id}`.
  - Updated frontend with Priority Interventions ranking, savings badges (kWh & kgCO2e), and provenance details.
  - Verified 37 automated tests passing with zero LLM dependency.

## Pending Work
- **Phase 5 — RAG**: Local knowledge base, vector index, and evidence retrieval.
- **Phase 6 — Agent + Local LLM**: Allowlisted tool execution, Ollama adapter, no-LLM fallback.
- **Phase 7 — UI**: Incremental dashboard integration.
- **Phase 8 — Evaluation**: Benchmark dataset and verification metrics.
- **Phase 9 — Hardening**: Security audit and comprehensive test suite pass.
- **Phase 10 — Demo Packaging**: Documentation, demo dataset, and one-command local startup.

## Decisions Made
1. **Zero-LLM Recommendation Gate**: All recommendation ranking, impact calculations, and effort estimations are 100% deterministic code. LLMs will later be used only to explain recommendations in conversational Q&A.
2. **Score Transparency**: Each intervention displays its impact, confidence, effort level, and mathematical formula provenance so users understand why interventions are prioritized.

## Assumptions
- Telemetry intervals are periodic.
- Energy values in kWh are non-negative.

## Known Issues
- None. 37 automated tests passing. Frontend build passes in 1s.

## Commands Used
- `uv run --extra dev pytest -v` (37 passed in 3.91s)
- `cd apps/web && npm run build` (Passed cleanly, 0 errors)
- `git commit -m "..." && git push origin main` (Phase 3 committed and pushed)

## Test Status
- Automated tests: 37 passed, 0 failed.
- Frontend build: Passed cleanly.

## Human Actions Required
- None.

## Next Action
- Commit Phase 4 to GitHub and proceed to Phase 5 (Knowledge Base & Local RAG Retrieval).
