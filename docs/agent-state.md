# TerraOps Agent State

## Project Status
- **Current Status**: Active — Phase 2 (Data Ingestion & Deterministic Metrics) Completed Successfully
- **Target Goal**: Build TerraOps sustainability decision-support product (SDG 13 Climate Action) adhering to zero-cost, local-first architecture.

## Current Phase
- **Phase 2 — Data + Metrics** (Completed)
- **Next Phase**: Phase 3 — Analytics (Anomaly detection using Isolation Forest / z-score and baseline near-term forecasting)

## Completed Work
- **Phase 0 — Inspect & Environment Assessment**:
  - Validated instructions and environment runtimes.
  - Confirmed zero-cost architecture baseline.
  - Authored `docs/technical-assessment.md` and initial `docs/agent-state.md`.
- **Phase 1 — Bootstrap**:
  - Created `.env.example`, `README.md`, `pyproject.toml`, and `docker-compose.yml`.
  - Built `apps/api` skeleton with `/health` and CORS.
  - Built `apps/web` Vite + React 18 + TS frontend shell.
  - Set up test harness and verified 6 initial unit tests.
- **Phase 2 — Data + Metrics**:
  - Created versioned emission factor registry in `data/factors/emission_factors.json` with EPA eGRID and EEA factors.
  - Built `packages/domain/factors/repository.py` with regional lookups and fallback handling.
  - Built streaming/batch ingestion validator in `packages/domain/ingestion/validator.py` with field-level error reporting, range checks (`[0, 1]` utilization), and non-negative energy enforcement.
  - Implemented deterministic metrics calculator in `packages/domain/metrics/calculator.py` computing Total Energy (kWh & MWh), Scope 2 Emissions (kgCO2e & tCO2e), utilization percentiles, idle capacity, and period-over-period comparisons.
  - Added API routers `apps/api/routers/data.py` (`POST /api/data/upload`, `POST /api/data/demo`, `GET /api/data/summary`) and `apps/api/routers/metrics.py` (`GET /api/metrics/summary`, `GET /api/metrics/factors`).
  - Added UI controls for loading demo data, uploading operational CSVs, viewing live metrics cards, and inspecting factor provenance.
  - Added full test suite (23 tests across unit and integration suites, all passing).

## Pending Work
- **Phase 3 — Analytics**: Anomaly detection (rolling z-score / Isolation Forest) and baseline forecasting.
- **Phase 4 — Recommendations**: Deterministic intervention scoring and ranking engine.
- **Phase 5 — RAG**: Local knowledge base, vector index, and evidence retrieval.
- **Phase 6 — Agent + Local LLM**: Allowlisted tool execution, Ollama adapter, no-LLM fallback.
- **Phase 7 — UI**: Incremental dashboard implementation.
- **Phase 8 — Evaluation**: Benchmark dataset and verification metrics.
- **Phase 9 — Hardening**: Security audit and comprehensive test suite pass.
- **Phase 10 — Demo Packaging**: Documentation, demo dataset, and one-command local startup.

## Decisions Made
1. **Factor Provenance**: Regional grid intensity factors are explicitly tracked with IDs and sources (e.g. US EPA eGRID RFC East `0.312 kgCO2e/kWh`).
2. **Error Tolerance**: Ingestion supports partial ingestion mode where bad rows are reported with line number, field, and rejected value, allowing clean rows to proceed.
3. **Deterministic Integrity**: No LLM is involved in any emission math, cost calculations, or factor lookups.

## Assumptions
- Telemetry timestamps are ISO8601 strings.
- Electricity consumption is measured in kilowatt-hours (kWh).

## Known Issues
- None. 23 unit and integration tests passing. Frontend build passes in <1s.

## Commands Used
- `uv run --extra dev pytest -v` (23 passed in 1.03s)
- `cd apps/web && npm run build` (Passed cleanly, 0 errors)
- `git add ... && git commit -m "..." && git push origin main` (Phase 1 committed and pushed)

## Test Status
- Automated tests: 23 passed, 0 failed.
- Frontend build: Passed cleanly.

## Human Actions Required
- None.

## Next Action
- Proceed to Phase 3 (Analytics — Anomaly Detection & Baseline Forecasting).
