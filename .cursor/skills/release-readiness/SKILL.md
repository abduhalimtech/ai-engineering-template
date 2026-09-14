---
name: release-readiness
description: Determines whether a completed change is ready for human merge or release using evidence from checks, review, verification, security, and CI. Use when the Coordinator is about to report READY_FOR_MERGE or when asked if a task can be merged.
---

# Release readiness

A change is ready for human merge only with evidence, not optimism.

## Checklist

- [ ] Acceptance criteria met (Verifier evidence, not Implementer assertion)
- [ ] Deterministic checks: tests/lint/types/build as applicable, each `PASSED` or explicitly `NOT_APPLICABLE`
- [ ] Code review `APPROVED` (independent)
- [ ] Verification `PASSED` for non-trivial work
- [ ] Security `PASSED` or `NOT_REQUIRED` with a one-line reason
- [ ] CI `PASSED` or `NOT_RUN` with reason (no CI in this repo yet)
- [ ] No secrets in the diff
- [ ] Task artifact results filled (if a task file exists)
- [ ] Remaining risks listed honestly

## Block merge when

Any required check is `FAILED` or was skipped and converted into `PASSED`. HIGH/CRITICAL work lacks a security verdict. Destructive/production actions lack human approval.

## Report

Use the Coordinator final report in `AGENTS.md`. Status is `READY_FOR_MERGE`, `BLOCKED`, or `DONE`. Human still merges.
