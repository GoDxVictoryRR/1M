# TerraOps Antigravity Build Pack

This folder contains the project-specific instructions for building TerraOps with Google Antigravity.

## Recommended placement
Copy the entire `.agents` directory into the TerraOps repository root.

Antigravity's current conventions support workspace rules in `.agents/rules/`, reusable skills in `.agents/skills/<skill>/SKILL.md`, and custom agents in `.agents/agents/`. Keep these paths unchanged. 

## Files
- `AGENTS.md` — always-on project instructions.
- `agents/terraops-builder.md` — dedicated builder agent.
- `rules/terraops.md` — persistent project rule.
- `skills/terraops-builder/SKILL.md` — reusable implementation skill.
- `spec/main.md` — product/build contract and sequencing.
- `spec/feature.md` — feature acceptance criteria.
- `spec/architecture.md` — architecture and interfaces.
- `spec/build.md` — phase-by-phase build instructions.
- `spec/ai.md` — AI, RAG, and agent constraints.
- `spec/data.md` — data and provenance rules.
- `spec/testing.md` — tests and release gates.
- `spec/deployment.md` — local and optional public deployment.
- `spec/security.md` — security/responsible-AI controls.
- `spec/handoff.md` — exact human-stop protocol.
- `spec/context.md` — context-window discipline.
- `spec/skill.md` — compact execution skill.
- `spec/resume.md` — portfolio polish rules.

## Suggested first Antigravity instruction
Read `.agents/AGENTS.md` and `.agents/spec/main.md`. Inspect the repository. Do not code yet. Create `docs/agent-state.md` with the current phase, repository findings, proposed first task, and any blocker. Then proceed with Phase 0/Phase 1 from `build.md` only if no human decision is required.
