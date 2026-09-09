# TerraOps Human Handoff Protocol

Use this file whenever progress depends on an action the agent cannot safely perform.

## Stop immediately when
- an API key or credential is required;
- a login or OAuth approval is required;
- a cloud/project account must be created;
- billing must be enabled or a paid plan selected;
- a dataset license/terms need human approval;
- a legal/compliance decision is required;
- production DNS/domain ownership must be changed;
- a system package/install requires elevated privileges and the repository cannot proceed without it;
- a hardware/resource choice materially affects the local model path.

## Handoff format
Return only:

**BLOCKED ON HUMAN ACTION**

**Reason:** <one sentence>

**Do this:**
1. <exact action>
2. <exact action>

**Do not share:** API keys, passwords, tokens, private certificates, or other secrets in chat or git.

**After completion:** Reply with “done” and, if applicable, the non-secret identifier/status that was created.

**Resume at:** <file + section or exact build phase>

## Never do
- Never guess a secret.
- Never request the human to paste a secret into a source file.
- Never silently substitute a paid service.
- Never claim deployment succeeded without a reachable/tested endpoint.
- Never continue past an explicit billing screen.
