# TerraOps Security and Responsible AI Contract

## Security baseline
Implement:
- environment-based secrets;
- input validation;
- upload size/type limits;
- safe file names;
- path traversal protection;
- parameterized database queries;
- CORS restrictions;
- structured error responses;
- dependency update checks.

## AI safety
The assistant must:
- state uncertainty when evidence is missing;
- avoid unsupported causal claims;
- avoid presenting estimates as verified facts;
- cite evidence where evidence is required;
- never execute destructive actions;
- never expose secrets.

## Fairness
Do not use personal demographic attributes in recommendation logic.
Avoid geographic recommendations unless geography is necessary and the factor/source supports it.

## Transparency
For every recommendation show, where applicable:
- inputs used;
- calculation/factor reference;
- assumptions;
- confidence/data-quality note;
- evidence sources.

## Privacy
Minimize stored information.
Do not store raw conversation text unless needed for local debugging, and never store secrets.
Make local logs easy to clear.

## Incident behavior
If a secret is accidentally detected in repository files:
1. STOP.
2. Do not print the secret.
3. Tell the human a secret-like value was detected and identify only the file/path and line range if safe.
4. Recommend revocation/rotation through the provider's official UI.
5. Remove the secret from the repository after human approval if needed.

## Release gate
Security checks must pass before public deployment.
