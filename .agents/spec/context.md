# TerraOps Context Window Rules

Optimize every agent turn for limited context.

## Loading order
Default:
1. `.agents/AGENTS.md`
2. `.agents/spec/main.md`
3. one task-specific spec file
4. relevant source files only
5. relevant tests only

## Do not load
- the whole repository;
- generated build output;
- model files;
- database dumps;
- large datasets;
- all spec files at once.

## Chunking rules
- Keep individual spec files focused on one concern.
- Keep implementation tasks narrow.
- Prefer interfaces, schemas, and acceptance criteria over long examples.
- Summarize prior work in a small `docs/agent-state.md` file when a task spans many turns.

## Agent state file
Maintain:
- current phase;
- completed gates;
- failing tests;
- next task;
- human blockers;
- important architectural decisions.

Keep it under roughly 200 lines.

## Completion summary
At the end of a turn, output:
- changed files;
- tests run and result;
- current phase/gate;
- blockers;
- next task.

Do not restate entire specifications.
