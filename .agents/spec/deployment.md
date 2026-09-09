# TerraOps Deployment Instructions

## Deployment principle
The project must remain usable without deployment. Local Docker Compose is the primary supported environment.

## Local deployment
Required:
- Docker Compose file;
- backend container;
- frontend container or a single app container only if architecture permits;
- local persistent volume for SQLite/knowledge/index data;
- `.env.example` containing no secrets.

Verify:
1. clean clone;
2. copy `.env.example` to local `.env` if needed;
3. build containers;
4. start containers;
5. health check API;
6. open frontend;
7. load demo data;
8. run smoke tests.

## Optional no-cost public demo
Before choosing a host, inspect the provider's current free/open-source terms and confirm that the required workload is actually free. Do not rely on stale assumptions about “free tiers.”

Preferred strategy:
- static frontend on a no-cost static host;
- backend/demo app on a no-cost host that supports containers or Python;
- local/open-source model path remains the default;
- if public hosting cannot support local model inference, deploy the deterministic/RAG/recommendation portions and clearly label local-LLM as an optional local feature.

Do not create billing or paid resources.

## Human handoff: public deployment
STOP before any of these:
- account creation/login;
- connecting GitHub OAuth;
- creating a cloud/project workspace;
- adding deployment secrets;
- configuring a custom domain/DNS;
- approving a third-party authorization scope;
- selecting anything that says paid/billing/upgrade.

When stopping, give the human a checklist with exact UI actions but never request a secret in chat. After the human completes it, continue from the deployment step.

## Deployment security
- production debug mode off;
- CORS restricted to known frontend origins;
- upload limits enabled;
- rate limit or basic abuse protection where supported;
- no development secrets;
- no sample credentials;
- no admin endpoint exposed publicly;
- health endpoints disclose only non-sensitive status.

## Deployment acceptance
A public demo is acceptable only if:
- the app is reachable without exposing secrets;
- the demo uses non-sensitive data;
- core dashboard works;
- RAG sources are visible;
- failures are handled gracefully;
- the human can shut down/delete the deployment without cost.

## Rollback
Before public deployment:
- create a known-good git commit/tag;
- record environment variables by name only, not values;
- document the deployment target and version.

If deployment fails or unexpectedly requires payment, STOP, restore the last local-good state, and ask the human rather than escalating permissions or spending money.
