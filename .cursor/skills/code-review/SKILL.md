---
name: code-review
description: Project-specific independent code review procedure against a task spec and diff. Use when the Coordinator delegates to the code-reviewer agent or when a completed implementation must be judged before verification.
---

# Code review procedure

Review the **diff and related call paths**, not the whole repository, and not the Implementer's story.

## Procedure

1. Read the task spec: acceptance criteria, non-goals, constraints, risk.
2. Collect the actual diff (`git diff` / changed files).
3. Check behavior against acceptance criteria.
4. Hunt defects: correctness, edge cases, regressions, error handling, data consistency, missing tests, API compatibility.
5. Skip formatter/linter noise.
6. Emit only actionable findings in the reviewer format from `.cursor/agents/code-reviewer.md`.
7. End with exactly one verdict: `APPROVED` or `CHANGES_REQUIRED`.

## Do not

- Approve because tests were *said* to pass.
- Re-architect the feature.
- Repeat a security audit (that is `security-auditor`).
- Review unchanged files unless they are on the call path.

After `CHANGES_REQUIRED` fixes, re-review the new diff only.
