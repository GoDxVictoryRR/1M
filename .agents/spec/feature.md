# TerraOps Feature Specification

Implement features in vertical slices. Each slice must be independently testable.

## F1. Data ingestion
Input: CSV.
Minimum supported fields:
- timestamp
- resource_id
- resource_type
- utilization or activity metric
- energy_kwh OR a configurable energy-estimation input
- region/site

Behavior:
- validate schema;
- reject malformed rows with actionable errors;
- retain raw rows and normalized rows separately when practical;
- expose dataset summary.

Acceptance:
- valid demo CSV loads;
- invalid schema produces clear field-level errors;
- null/negative/impossible values are handled by explicit policy.

## F2. Metrics engine
Calculate deterministic metrics:
- total energy estimate;
- estimated emissions;
- utilization statistics;
- period-over-period changes;
- configurable carbon intensity and factor metadata.

Every calculated result must carry:
- value;
- unit;
- factor/source id;
- calculation version;
- uncertainty/assumption note where applicable.

## F3. Anomaly detection
Start with robust, explainable methods such as rolling z-score or Isolation Forest.
Do not start with deep learning.

Return:
- anomaly score;
- threshold;
- affected resource/time range;
- explanation features.

## F4. Forecasting
Use a simple baseline first (seasonal naive or moving average), then add a lightweight ML option if the dataset supports it.

Acceptance:
- baseline is always available;
- model comparison is recorded;
- insufficient history produces a controlled “not enough data” state.

## F5. Recommendation engine
Define intervention templates such as:
- right-size underutilized resources;
- schedule non-critical workloads;
- reduce unnecessary runtime;
- shift flexible workloads to lower-impact periods/regions when supported by data;
- investigate anomalous consumption.

For each intervention calculate a transparent score from:
- estimated impact;
- confidence;
- effort;
- data quality.

Do not let the LLM invent the score.

## F6. Knowledge base + RAG
Create a small versioned local knowledge base.
Each document/chunk needs:
- source title;
- source URL or local source id;
- publisher/owner;
- date if available;
- text;
- tags.

Index with local embeddings.
Retrieve top-k chunks using semantic similarity, optionally combined with keyword filtering.

Acceptance:
- each response can expose citations/source ids;
- empty retrieval does not become a confident answer;
- stale/unknown source metadata is visible.

## F7. Recommendation agent
Create a controlled agent that can call only allowlisted read-only tools:
- get_metrics
- get_anomalies
- get_forecast
- search_knowledge
- estimate_impact
- rank_interventions

The agent may compose tool results and explain them. It may not mutate infrastructure.

## F8. Local conversational assistant
Support questions such as:
- “What should we fix first?”
- “Why is this recommendation ranked higher?”
- “What evidence supports this?”
- “What would happen if we reduced runtime by 10%?”

The assistant must expose assumptions and cite retrieved evidence where relevant.

## F9. Dashboard
Required views:
- overview KPI cards;
- trend chart;
- anomaly table;
- forecast chart;
- recommendation ranking;
- evidence/source panel;
- assistant panel;
- evaluation/health view.

Do not overbuild visual design. Prioritize clarity and responsiveness.

## F10. Export
Provide a PDF-friendly or HTML report export containing:
- period;
- data quality summary;
- key metrics;
- top recommendations;
- evidence/assumptions;
- limitations.

## F11. Graceful degradation
Without Ollama/LLM:
- dashboard, metrics, anomaly detection, forecasting, recommendation ranking, and retrieval must still work;
- assistant should return a clear message that local generation is unavailable.

Without a remote deployment account:
- local Docker deployment remains the primary supported path.
