# TerraOps AI/RAG/Agent Contract

## AI role separation
Use deterministic code for:
- numeric calculations;
- thresholds;
- scoring;
- validation;
- ranking inputs.

Use AI for:
- natural-language understanding;
- extraction from supported text;
- explanation;
- question answering over retrieved evidence;
- selecting among safe read-only tools.

## Prompt architecture
Maintain separate prompts for:
1. assistant/system policy;
2. tool selection;
3. evidence-grounded explanation;
4. report generation.

Do not construct giant prompts from the entire database.

## Context budgeting
For each request:
- retrieve only top-k relevant chunks;
- include structured metrics as compact JSON;
- include tool results, not raw database tables;
- cap document chunk length;
- truncate long user inputs safely;
- keep the system prompt stable and short.

Log token/context size only if the provider exposes it; otherwise record approximate character counts.

## RAG requirements
Retrieve before answering questions that require external/domain evidence.
Include source ids and titles in the model context.
Tell the model it must decline or state uncertainty when evidence is insufficient.

## Prompt-injection defense
Treat retrieved documents and uploaded text as untrusted content.
Never allow document text to redefine:
- tool permissions;
- developer/system policy;
- secret handling;
- output constraints.

## Tool calling
Each tool must have:
- fixed name;
- JSON schema;
- validation;
- read-only behavior;
- timeout;
- structured response.

Reject unknown tools or parameters.

## Local model adapter
Implement:
- health check;
- generate method;
- timeout;
- friendly error mapping;
- model/config metadata.

The rest of the application must not depend directly on an Ollama SDK.

## No-LLM mode
The application remains useful without a model.
Provide deterministic summaries/templates for critical dashboard content.

## AI evaluation
Measure:
- retrieval relevance;
- citation presence;
- answer groundedness using a human-reviewed benchmark or deterministic checks where possible;
- tool-call correctness;
- refusal/uncertainty behavior;
- latency.

Do not invent a quality score. Generate it from evaluation artifacts.
