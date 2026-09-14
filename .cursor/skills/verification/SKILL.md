---
name: verification
description: Independently proves a change satisfies acceptance criteria by executing tests and checking observable behavior. Use after code review is APPROVED and before merge, or when the Coordinator needs a Verifier pass.
---

# Verification procedure

Question: does the implementation **actually** satisfy the requested behavior?

## Procedure

1. Read acceptance criteria and the verification plan.
2. Identify observable behavior (API responses, UI, jobs, data).
3. Run the relevant deterministic commands from `.cursor/rules/testing.mdc`. Prefer execution over inspection.
4. Exercise important edge cases and nearby regressions.
5. If UI changed and browser tools exist, exercise the flow (not just a screenshot).
6. Record command + `PASSED` / `FAILED` / `NOT_RUN` / `NOT_APPLICABLE`.

## Verdict

`VERIFICATION: PASSED` or `VERIFICATION: FAILED` as specified in `.cursor/agents/verifier.md`.

On failure, do not patch. Return to Coordinator → Implementer.

Code looking correct, Implementer claims, or Reviewer `APPROVED` are not evidence of behavior.
