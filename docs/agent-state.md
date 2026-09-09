# TerraOps Agent State

## Project Status
- **Current Status**: Active — Phase 3 (Analytics: Anomaly Detection & Forecasting) Completed Successfully
- **Target Goal**: Build TerraOps sustainability decision-support product (SDG 13 Climate Action) adhering to zero-cost, local-first architecture.

## Current Phase
- **Phase 3 — Analytics** (Completed)
- **Next Phase**: Phase 4 — Recommendations (Rule/template-based intervention generation and transparent multi-factor scoring)

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
  - Built explainable anomaly detector in `packages/domain/analytics/anomaly.py` supporting rolling z-score and scikit-learn Isolation Forest.
  - Detected and verified synthetic spike on sample dataset (srv-compute-01 at 13:00, 35.4 kWh with utilization 99%, z >= 2.5).
  - Built baseline time-series forecaster in `packages/domain/analytics/forecasting.py` using trend-augmented moving average with 95% confidence intervals and model evaluation metrics (MAE, RMSE, trend slope).
  - Enforced insufficient data guardrails (returns controlled `insufficient_data` status when intervals < 6).
  - Added API endpoints in `apps/api/routers/analytics.py` (`GET /api/analytics/anomalies`, `GET /api/analytics/forecast`).
  - Added UI views for interactive anomaly inspection and forecast tables.
  - All 31 automated tests passing cleanly.

## Pending Work
- **Phase 4 — Recommendations**: Deterministic intervention scoring and ranking engine (right-sizing, off-peak scheduling, idle elimination, anomaly investigation).
- **Phase 5 — RAG**: Local knowledge base, vector index, and evidence retrieval.
- **Phase 6 — Agent + Local LLM**: Allowlisted tool execution, Ollama adapter, no-LLM fallback.
- **Phase 7 — UI**: Incremental dashboard integration.
- **Phase 8 — Evaluation**: Benchmark dataset and verification metrics.
- **Phase 9 — Hardening**: Security audit and comprehensive test suite pass.
- **Phase 10 — Demo Packaging**: Documentation, demo dataset, and one-command local startup.

## Decisions Made
1. **Explainable Anomaly Logic**: Every detected anomaly produces a plain-English explanation of deviation from rolling baseline (mean ± std) rather than an opaque black-box number.
2. **Confidence Intervals**: Forecaster derives prediction margins from residual standard errors, guaranteeing non-negative lower bounds.
3. **Graceful Insufficient Data**: If telemetry has fewer than 6 chronological points, the forecaster returns a structured non-error response informing the user.

## Assumptions
- Telemetry intervals are periodic.
- Energy values in kWh are non-negative.

## Known Issues
- None. 31 automated tests passing. Frontend build passes in <1s.

## Commands Used
- `uv run --extra dev pytest -v` (31 passed in 3.68s)
- `cd apps/web && npm run build` (Passed cleanly, 0 errors)

## Test Status
- Automated tests: 31 passed, 0 failed.
- Frontend build: Passed cleanly.

## Human Actions Required
- None.

## Next Action
- Commit Phase 3 to GitHub and proceed to Phase 4 (Recommendations Engine).
