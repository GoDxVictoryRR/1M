# TerraOps Main Build Contract

## Product identity
Build a sustainability decision-support product named **TerraOps**. Do not emphasize “AI” in the product name or branding.

## Purpose
Help a user reduce the environmental footprint of an organization or facility by turning operational data into a prioritized, explainable action plan.

## SDG alignment
Primary: **UN SDG 13 – Climate Action**.
Secondary: SDG 12 – Responsible Consumption and Production; optionally SDG 7 – Affordable and Clean Energy.

Use the internship guideline as the source for project framing: real problem, affected users, clear role for AI, measurable impact, and responsible AI. Do not claim official SDG certification.

## MVP user journey
1. User opens dashboard.
2. User loads the included demo dataset or uploads a supported CSV.
3. System validates the data.
4. System calculates deterministic operational metrics and estimated emissions/impact using versioned factors.
5. System detects anomalies and forecasts near-term demand where enough history exists.
6. User asks a sustainability question.
7. Retrieval returns relevant knowledge/factor/policy sources.
8. Recommendation engine ranks interventions by impact, effort, and confidence.
9. Local LLM optionally explains the recommendations in natural language.
10. User sees sources, assumptions, confidence, and next actions.
11. User can export a report.

## Required product modules
- Dashboard
- Data ingestion and validation
- Metrics engine
- Anomaly detection
- Forecasting
- Recommendation scoring
- Knowledge/RAG retrieval
- Tool-using recommendation agent
- AI explanation/chat layer
- Evaluation dashboard
- Report export

## Default zero-cost path
The default path must run locally with open-source components and no API key.

Target stack:
- Python 3.11+
- FastAPI backend
- React + TypeScript frontend, preferably Vite for a lean build
- PostgreSQL if available; SQLite for the zero-setup local profile
- scikit-learn for classical ML
- pandas/polars for data processing
- sentence-transformers for local embeddings
- FAISS or a lightweight vector store for local retrieval
- Ollama for optional local LLM inference
- pytest + httpx for backend tests
- Vitest/Playwright for frontend/e2e tests as appropriate
- Docker Compose for reproducible local setup

Keep dependencies replaceable through interfaces. If a dependency is unavailable, use a simpler open-source alternative rather than a paid service.

## Product constraints
- Recommendation-only MVP; no automatic cloud/resource changes.
- No personal or sensitive user data is required.
- Demo data must be synthetic or clearly redistributable.
- All estimates must show assumptions and data/factor provenance.
- No hallucinated sources.
- No fabricated “savings” claims without calculation.

## Context-window policy
Never put the entire codebase, dataset, or all specs into one prompt. Work by module.
Use the smallest relevant files. Prefer summaries and interfaces over copying implementation bodies.

## Build sequence
Read `architecture.md` before architecture work.
Read `feature.md` before feature implementation.
Read `build.md` before coding.
Read `testing.md` before final verification.
Read `deployment.md` only for deployment work.
Read `skill.md` for implementation behavior and use it as the reusable engineering policy.

## Global acceptance criteria
The MVP is ready only when:
- local setup works from a clean checkout;
- demo data loads;
- at least one anomaly and one forecast are generated deterministically;
- recommendations are traceable to numeric metrics;
- RAG returns source references;
- the local AI explanation path works when Ollama is installed and degrades gracefully when it is not;
- automated tests pass;
- no secret is required for the default path;
- Docker Compose starts the application;
- deployment artifacts are present;
- a human can follow the README to reproduce the demo.

## Human handoff rule
If a later optional deployment path needs a platform account or secret, stop exactly at that point. Do not bypass the requirement or assume access.
