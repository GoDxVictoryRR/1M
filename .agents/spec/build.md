# TerraOps Build Instructions

## Phase 0 — Inspect
- Inspect repository, package managers, existing tests, and existing README.
- Do not delete or replace working project files without evidence.
- Identify operating system and available runtimes.
- Check whether Docker is installed.
- Check whether Ollama is installed; do not install system software without human approval.

STOP if the repository is not the intended project or if existing requirements conflict with the TerraOps contract. Explain the conflict and ask the human.

## Phase 1 — Bootstrap
Create the smallest runnable skeleton:
- API health endpoint;
- frontend shell;
- local configuration;
- test harness;
- Docker Compose;
- demo data loader placeholder.

Run unit tests immediately.

## Phase 2 — Data + metrics
Implement ingestion and deterministic metrics before adding any LLM.
Add fixtures and unit tests.

Gate:
- demo dataset loads;
- metrics are reproducible;
- invalid data fails cleanly.

## Phase 3 — Analytics
Implement anomaly detection and forecasting.
Start with baselines before advanced models.

Gate:
- synthetic test cases trigger known anomalies;
- forecast output schema is stable;
- insufficient data behavior is tested.

## Phase 4 — Recommendations
Implement rule/template-based recommendations and transparent scoring.

Gate:
- recommendations can be generated with the LLM completely disabled.

## Phase 5 — RAG
Create the local knowledge base, parser/chunker, embeddings, vector index, retrieval API, and source metadata.

Gate:
- known query retrieves expected source;
- unknown query yields low-confidence/insufficient-evidence result;
- no test requires internet access.

## Phase 6 — Agent + local LLM
Add tool schemas and a provider adapter.
Add Ollama integration behind the adapter.

Gate:
- tool allowlist enforced;
- invalid tool arguments rejected;
- assistant can answer from tool results;
- no-LLM fallback works.

STOP for human help if a model download, runtime installation, or local hardware constraint prevents the optional LLM path and the human must choose whether to install/allocate resources.

## Phase 7 — UI
Implement dashboard incrementally:
1. KPIs
2. trends
3. anomalies
4. forecasts
5. recommendations
6. evidence panel
7. assistant
8. evaluation/health

After each screen, run frontend tests/build.

## Phase 8 — Evaluation
Create a fixed benchmark dataset/questions.
Measure:
- ingestion correctness;
- anomaly detection on labeled fixtures;
- forecast baseline error;
- recommendation ranking consistency;
- retrieval hit@k or equivalent;
- citation presence;
- answer faithfulness checks;
- latency.

Do not invent benchmark numbers. Generate them from executed tests.

## Phase 9 — Hardening
Run security checks, dependency audit where available, full tests, frontend build, backend startup, and Docker Compose startup.

## Phase 10 — Demo packaging
Create:
- README;
- `.env.example` with non-secret placeholders;
- demo dataset;
- sample knowledge sources;
- architecture diagram source if used;
- screenshots only after the app is functional;
- one-command or few-command local startup.

## Build cadence
For every major phase:
- implement;
- test;
- summarize evidence;
- continue only if the gate passes.

Do not accumulate many unverified changes.
