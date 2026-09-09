---
name: terraops-builder
description: Use when implementing or reviewing TerraOps features, AI workflows, data pipelines, tests, or deployment configuration. Enforces zero-cost architecture, small context windows, verification, and human handoffs.
---

# TerraOps Build Skill

## Use this skill when
- implementing a TerraOps feature;
- changing the AI/RAG/agent workflow;
- modifying data or ML code;
- preparing tests;
- preparing deployment configuration;
- reviewing security, quality, or production readiness.

## Required workflow
1. Identify the relevant spec file.
2. Read the existing code and tests.
3. Write/adjust the smallest implementation that satisfies the acceptance criteria.
4. Add or update tests before expanding scope.
5. Run formatting/lint/type/unit tests relevant to the change.
6. Run integration/e2e tests when the change crosses process or storage boundaries.
7. Update docs/config only when needed to make the feature reproducible.
8. Record assumptions and limitations.

## AI implementation rule
AI must not be the source of truth for numeric calculations. Use deterministic Python/domain functions for carbon, cost, scoring, validation, and thresholds. Use the LLM for extraction, explanation, planning, and conversational interaction.

## RAG rule
Retrieve first, then generate. Every user-visible policy/knowledge claim should have a source reference in the application data model. Tests must verify retrieval failures and insufficient evidence behavior.

## Agent rule
Agents may select tools but must not execute destructive actions. TerraOps is recommendation-only in the MVP. Tool calls must be allowlisted and validated.

## Stop conditions
Stop for human action on secrets, account setup, billing, deployment ownership, license approval, data-rights approval, or production infrastructure changes.
