---
name: task-refinement
description: Turns a rough engineering request into a READY task with problem, desired behavior, acceptance criteria, non-goals, constraints, risk, and verification plan. Use when the Coordinator receives an incomplete, imprecise, or symptom-level request before implementation.
---

# Task refinement

Transform a rough request into an executable task. Inspect first. Do not start with a questionnaire.

## Steps

1. Inspect the codebase (and existing docs/tests) for current behavior.
2. Infer likely intended behavior from code, names, and adjacent features.
3. Resolve technical questions from the repository. Ask the human only when the answer materially changes product behavior, is destructive, or has several valid outcomes.
4. If a reasonable assumption is low-risk and reversible, proceed and state it.
5. Write acceptance criteria that are observable.
6. Write non-goals so the Implementer does not expand scope.
7. Classify risk: LOW / MEDIUM / HIGH / CRITICAL (see `AGENTS.md`).
8. Choose the workflow and specialists.
9. For non-trivial work, write `.ai/tasks/TASK-NNN-short-slug.md` using the template in `AGENTS.md`.

## Preferred ask

> I inspected the current implementation. I can infer A, B and C from the code. One product decision remains: should X behave like option 1 or option 2?

## Bad ask

A list of questions the repository can already answer.

## Output

```text
problem
desired behavior
acceptance criteria
non-goals
constraints
risk
verification plan
agents needed
```
