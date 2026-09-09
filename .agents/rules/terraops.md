# TerraOps Workspace Rule

Always keep the default product path runnable without paid services.

Use local open-source AI by default. Keep provider-specific AI behind a small adapter interface so an optional remote provider can be added later without changing product logic.

Never hardcode model names, endpoints, API keys, carbon factors, or cloud prices in feature code. Put configurable values in environment variables or versioned config files with safe defaults.

Prefer deterministic synthetic fixtures for tests. External services must be mocked in automated tests.

Every AI response shown to users must include enough provenance/metadata for the UI to distinguish retrieved evidence, calculated values, model-generated text, and uncertainty.

When a user asks for a recommendation, calculate the measurable metrics first and use the LLM only for explanation, prioritization, or natural-language interaction.
