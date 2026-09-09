# TerraOps Agent State

## Project Status
- **Current Status**: Active — Phase 5 (Local RAG Knowledge & Retrieval Engine) Completed Successfully
- **Target Goal**: Build TerraOps sustainability decision-support product (SDG 13 Climate Action) adhering to zero-cost, local-first architecture.

## Current Phase
- **Phase 5 — RAG** (Completed)
- **Next Phase**: Phase 6 — Agent + Local LLM (Allowlisted Tool Execution, Ollama Provider Adapter, and Strict No-LLM Fallback)

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
  - Built section-aware Markdown parser and chunker preserving metadata (publisher, publication date, source URLs, tags, section titles).
  - Built offline, zero-cost vectorless hybrid TF-IDF + keyword/tag retriever (`packages/domain/rag/retriever.py`) with cosine similarity and stem-based query term coverage.
  - Strict insufficient-evidence guardrail: triggers warning when similarity < threshold or query term coverage < 35%.
  - Added API endpoints `GET /api/rag/search` and `GET /api/rag/documents`.
  - Integrated RAG explorer UI into frontend dashboard.
  - Verified 44 automated tests passing.

## Pending Work
- **Phase 6 — Agent + Local LLM**: Allowlisted tool execution, Ollama adapter, no-LLM fallback.
- **Phase 7 — UI**: Incremental dashboard integration.
- **Phase 8 — Evaluation**: Benchmark dataset and verification metrics.
- **Phase 9 — Hardening**: Security audit and comprehensive test suite pass.
- **Phase 10 — Demo Packaging**: Documentation, demo dataset, and one-command local startup.

## Decisions Made
1. **Zero-LLM Recommendation Gate**: All recommendation ranking, impact calculations, and effort estimations are 100% deterministic code.
2. **Hybrid Offline Retrieval**: TF-IDF + query term stem coverage eliminates remote API/model weights while maintaining 100% test reproducibility and zero cost.
3. **Strict Insufficient Evidence Guardrail**: Off-topic queries are flagged explicitly to prevent hallucinations before reaching any generation step.

## Commands Used
- `uv run --extra dev pytest -v` (44 passed in 4.10s)
- `cd apps/web && npm run build` (Passed cleanly, 0 errors)
- `git commit -m "..." && git push origin main`

## Test Status
- Automated tests: 44 passed, 0 failed.
- Frontend build: Passed cleanly.

## Next Action
- Push Phase 5 commit to GitHub, then proceed to Phase 6 (Agent + Local LLM).
