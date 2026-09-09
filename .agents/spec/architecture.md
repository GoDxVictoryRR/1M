# TerraOps Architecture Contract

## Architecture principle
Use a modular monolith for the MVP. Do not split into microservices until a measured need appears.

## Logical layers
1. Presentation: React/TypeScript UI.
2. API: FastAPI endpoints and request validation.
3. Application services: ingestion, analytics, recommendations, RAG, agent orchestration.
4. Domain: metrics, scoring, validation, factor models, recommendation rules.
5. Infrastructure: database, vector index, filesystem/object storage adapter, local model adapter.

## Suggested repository shape
```text
repo/
  apps/
    api/
    web/
  packages/
    domain/
    shared/
  data/
    demo/
    knowledge/
  scripts/
  tests/
    unit/
    integration/
    e2e/
  docs/
  .agents/
  docker-compose.yml
  README.md
```

If the repository already uses a different clean structure, preserve it and map these responsibilities to it rather than rewriting the project.

## Interfaces
Create explicit interfaces for:
- LLMProvider
- EmbeddingProvider
- VectorStore
- DataRepository
- FactorRepository
- ForecastModel
- RecommendationEngine

Default implementations must be local/open-source.

## Data flow
CSV -> validation -> normalized table -> metrics -> anomaly/forecast -> recommendations -> evidence-aware agent -> UI/export.

RAG path:
knowledge docs -> parse/chunk -> embed -> vector index -> retrieve -> source-aware context -> answer/explanation.

## Storage
Default profile:
- SQLite for application data;
- local filesystem for demo/knowledge artifacts;
- local FAISS or equivalent index.

Optional profile may use PostgreSQL when already available, but PostgreSQL must not be mandatory for the first local run.

## Model strategy
Do not couple product code to a specific LLM vendor.
Use Ollama through an adapter for local inference. Choose a current small instruct model only after checking the local machine's capability. If model download is too large for the machine, support a no-LLM mode instead of forcing cloud API usage.

## Security boundaries
- Read-only AI tools in MVP.
- Strict input validation.
- File upload type/size limits.
- Path traversal protection.
- No arbitrary shell/tool execution from user input.
- Secrets only via environment variables.
- No logging of secrets or raw sensitive input.

## Reliability
- Timeouts for model calls.
- Circuit/fallback behavior to deterministic paths.
- Structured errors.
- Idempotent ingestion where possible.
- Health endpoints for API and dependencies.

## Observability
Capture:
- request id;
- operation duration;
- model/provider label;
- retrieval hit count;
- tool calls;
- errors.

Do not capture secrets or unnecessary user content.

## Architecture stop rule
Do not introduce Kafka, Kubernetes, a paid vector DB, managed LLM APIs, or microservices in the MVP unless a measured requirement appears and the human explicitly approves the tradeoff. Default to the modular monolith.
