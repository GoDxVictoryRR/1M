# TerraOps Testing and Acceptance

## Testing philosophy
Prefer deterministic tests. Mock external/model boundaries. Keep a separate small set of real local-model smoke tests that run only when Ollama is available.

## Unit tests
Required coverage areas:
- CSV schema validation;
- normalization;
- factor lookup;
- carbon/impact calculations;
- recommendation scoring;
- anomaly logic;
- forecast baseline;
- retrieval ranking logic;
- tool argument validation;
- prompt/context assembly;
- privacy/logging sanitization.

Test edge cases:
- empty files;
- duplicate timestamps;
- missing values;
- negative values;
- extreme values;
- unknown resource types;
- no history;
- empty retrieval;
- malformed model output.

## Integration tests
Verify:
- CSV -> database/storage -> metrics;
- metrics -> analytics;
- analytics -> recommendation API;
- knowledge documents -> index -> retrieval;
- agent -> allowlisted tools -> structured result;
- API -> frontend API client.

Mock external APIs and network access by default.

## E2E tests
At minimum:
1. Open dashboard.
2. Load demo data.
3. Verify KPI appears.
4. Open anomaly view.
5. Open recommendations.
6. Ask a known RAG question.
7. Verify a source is shown.
8. Disable/omit LLM and verify graceful fallback.
9. Export report.

## AI evaluation set
Create a versioned JSON/CSV test set containing:
- question;
- expected tool(s);
- expected source ids where applicable;
- expected key facts/constraints;
- unacceptable behaviors.

Do not require exact wording.

## Security tests
Verify:
- no secret values appear in logs;
- upload path traversal is blocked;
- oversized files are rejected;
- unsupported file types are rejected;
- user input cannot select arbitrary tools;
- agent cannot call write/destructive tools;
- prompt-injected document content cannot override system/tool policy.

## Performance checks
For local demo targets only, measure rather than promise:
- API p50/p95 latency;
- retrieval latency;
- model response latency when Ollama is enabled;
- memory footprint where practical.

Record the machine profile used for any benchmark.

## Final release gate
Do not call the project release-ready unless:
- all mandatory tests pass;
- frontend production build passes;
- backend starts cleanly;
- Docker Compose starts cleanly;
- demo data is reproducible;
- known security tests pass;
- evaluation artifacts are generated;
- README steps work from a clean checkout.

## Human stop conditions
STOP if a failing test requires a change to requirements rather than a code fix. Ask the human which behavior should be authoritative.
