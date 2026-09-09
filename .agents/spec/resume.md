# TerraOps Resume/Portfolio Build Notes

This file is an instruction set for polishing the project after the functional MVP works.

## Portfolio positioning
Present TerraOps as a sustainability decision-support platform, not as a generic chatbot.

Highlight engineering depth:
- modular backend/API;
- data validation and deterministic analytics;
- anomaly detection and forecasting;
- recommendation scoring;
- local RAG;
- safe tool-using agent;
- local open-source model path;
- evaluation suite;
- Dockerized reproducibility.

## README must include
- problem;
- users;
- product workflow;
- architecture;
- local setup;
- demo walkthrough;
- AI/RAG/agent design;
- evaluation methodology and actual measured results;
- limitations;
- responsible AI;
- deployment status;
- screenshots only after functionality is verified.

## Git hygiene
Before finalizing:
- remove debug artifacts;
- remove secrets and secret-like values;
- add `.gitignore` for `.env`, caches, local DB, model artifacts when appropriate;
- use meaningful commits if the human wants a public portfolio history.

## Resume metrics
Do not invent impact metrics.
Generate resume-worthy numbers only from executed measurements such as:
- test cases;
- dataset size;
- retrieval benchmark size;
- measured latency;
- code/test counts;
- model size;
- successful local deployment time.

Use cautious wording for simulated results.
