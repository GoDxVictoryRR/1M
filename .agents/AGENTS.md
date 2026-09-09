# TerraOps Agent Workspace Instructions

Treat this repository as a real product engineering project and follow the TerraOps build specification in `.agents/spec/main.md`.

## Operating mode
- Build in small, verifiable increments.
- Read only the spec files required for the current task; do not load every spec file into context at once.
- Do not invent APIs, credentials, datasets, external services, regulatory claims, carbon factors, or pricing.
- Prefer open-source software, local execution, and deterministic test fixtures.
- Never spend money. Never create a paid resource, paid subscription, paid API call, or billable cloud resource.
- When a step requires a secret, account ownership, OAuth consent, cloud project, DNS change, billing setup, or other human-only action, STOP and ask the human for that exact action.
- Never ask the human to paste secrets into chat or commit secrets to the repository.
- Never deploy experimental code without tests passing and a rollback path.
- Do not claim a result is accurate unless it has been measured by the test/evaluation system.

## Source of truth
Use this order when instructions conflict:
1. Repository files and tests already approved by the human.
2. `.agents/spec/main.md`.
3. The relevant TerraOps spec file.
4. Existing project conventions.
5. General engineering judgment.

## Completion rule
A task is complete only when:
- the requested files/features exist;
- tests for changed behavior pass;
- lint/type checks pass where configured;
- documentation/configuration needed to run the feature is updated;
- no secrets are present;
- acceptance criteria in the relevant spec are satisfied.

If any criterion cannot be verified automatically, state exactly what remains and STOP at a human handoff point.
