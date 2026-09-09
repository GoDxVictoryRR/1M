# TerraOps Agent State

## Project Status
- **Current Status**: Active — Phase 1 (Bootstrap) Completed Successfully
- **Target Goal**: Build TerraOps sustainability decision-support product (SDG 13 Climate Action) adhering to zero-cost, local-first architecture.

## Current Phase
- **Phase 1 — Bootstrap** (Completed)
- **Next Phase**: Phase 2 — Data + Metrics (CSV ingestion, schema validation, deterministic emissions & energy calculations)

## Completed Work
- **Phase 0 — Inspect & Environment Assessment**:
  - Validated instructions and environment runtimes (Python 3.13/3.11, Node v22.16, npm 10.9, uv 0.11, Ollama active on port 11434).
  - Confirmed zero-cost architecture baseline.
  - Authored `docs/technical-assessment.md` and initial `docs/agent-state.md`.
- **Phase 1 — Bootstrap**:
  - Created `.env.example` with non-secret defaults.
  - Configured `pyproject.toml` with `fastapi`, `uvicorn`, `pydantic`, `httpx`, `pandas`, `pytest`, `pytest-asyncio`.
  - Implemented `apps/api` FastAPI skeleton with CORS middleware and `/health` diagnostic endpoint.
  - Implemented `apps/web` frontend shell with Vite, React 18, TypeScript, and modern responsive CSS design system.
  - Implemented `packages/domain/demo_loader.py` and created deterministic `data/demo/sample_operations.csv`.
  - Configured `docker-compose.yml`, `apps/api/Dockerfile`, and `apps/web/Dockerfile`.
  - Built test harness: `tests/unit/test_health.py` and `tests/unit/test_demo_data.py`.
  - Verified backend unit tests (6/6 passing).
  - Verified frontend build (`tsc && vite build` passing with zero errors).

## Pending Work
- **Phase 2 — Data + Metrics**:
  - Full ingestion pipeline for operational CSVs with granular row-level and schema error reporting.
  - Deterministic calculations for total energy consumption, estimated carbon emissions (Scope 1/2), utilization trends, and period-over-period delta.
  - Versioned emission factor registry (`data/factors/`).
- **Phase 3 — Analytics**: Anomaly detection (rolling z-score / Isolation Forest) and baseline forecasting.
- **Phase 4 — Recommendations**: Deterministic intervention scoring and ranking engine.
- **Phase 5 — RAG**: Local knowledge base, vector index, and evidence retrieval.
- **Phase 6 — Agent + Local LLM**: Allowlisted tool execution, Ollama adapter, no-LLM fallback.
- **Phase 7 — UI**: Incremental dashboard implementation.
- **Phase 8 — Evaluation**: Benchmark dataset and verification metrics.
- **Phase 9 — Hardening**: Security audit and comprehensive test suite pass.
- **Phase 10 — Demo Packaging**: Documentation, demo dataset, and one-command local startup.

## Decisions Made
1. **Packaging**: Used `uv` for reproducible Python environment management.
2. **Frontend Styling**: Clean vanilla CSS design system featuring curated dark theme, emerald/teal accents, responsive typography, and card-based diagnostic layouts.
3. **Health Check Scope**: `/health` inspects SQLite database path readiness and probes local Ollama status with timeout protection so offline AI never causes API failure.
4. **Validation Policy**: Demo CSV loader strictly enforces `[0, 1]` utilization bounds and non-negative energy numbers.

## Assumptions
- Local developer workflow can run either via native runtimes (`uv run` / `npm run dev`) or via `docker-compose`.
- No personal or proprietary data is collected or required.

## Known Issues
- None. All unit tests and builds are passing cleanly.

## Commands Used
- `uv run --extra dev pytest -v` (Backend test suite execution: 6 passed in 0.81s)
- `cd apps/web && npm install` (Installed frontend dependencies)
- `cd apps/web && npm run build` (TypeScript check and Vite bundle build passed)

## Test Status
- Backend unit tests: 6 passed, 0 failed.
- Frontend build: Passed cleanly (`dist/` generated).

## Human Actions Required
- None. Zero-cost local execution verified.

## Next Action
- Proceed to Phase 2 (Data Ingestion & Deterministic Metrics Engine).
