# TerraOps Execution Skill

Apply these instructions to every implementation task.

## Before coding
- Read `main.md`.
- Read only the spec file relevant to the requested change.
- Inspect current code/tests before designing new code.
- Preserve working code and interfaces unless a requirement forces change.

## While coding
- Implement the smallest coherent vertical slice.
- Prefer standard-library/simple open-source components before adding dependencies.
- Keep domain logic deterministic and testable.
- Keep LLM/provider code behind adapters.
- Keep agent tools read-only and allowlisted.
- Add tests with every behavior change.
- Avoid speculative abstractions.

## Validation
After each slice:
1. run focused tests;
2. run formatter/linter/type checks when configured;
3. run affected integration tests;
4. update the agent-state file if the task spans phases.

## Stop and hand off
Stop for secrets, accounts, billing, license decisions, external data approval, elevated system changes, or unresolved product decisions. Follow `handoff.md`.

## Final response
Report changed files, verification performed, blockers, and next task. Do not claim success without evidence.
