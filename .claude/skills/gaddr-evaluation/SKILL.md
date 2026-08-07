---
name: gaddr-evaluation
description: Build and review the Gaddr agent quality center, evaluation dashboard, localized metrics, regression states, and evidence-first release UI.
when_to_use: Use when changing the admin quality center, evaluation API client, agent metrics, model or prompt reporting, or user-visible release-quality status.
---

# Gaddr evaluation UI

Read [`docs/evaluation/AGENT_EVALUATION_UI.md`](../../../docs/evaluation/AGENT_EVALUATION_UI.md)
and the backend contract before changing the dashboard.

## Rules

- Use the backend metric/status contract; do not compute release decisions in React.
- Render `not_run` distinctly from pass and blocked. Never fill missing values with zero.
- Add every user-facing string to both locale catalogues.
- Use semantic theme tokens and accessible focus states in both color schemes.
- Keep metric formatting in a pure helper with a unit test.

## Review workflow

1. Confirm the route reads the backend contract instead of duplicating thresholds.
2. Keep `not_run` visibly distinct from both pass and blocked; never use zero as a placeholder.
3. Check English and Swedish, light and dark themes, keyboard focus, error loading, and mobile
   layout.
4. Run the focused Vitest test, direct typecheck, exact-path lint, and production build. Add a
   browser assertion when an authenticated fixture is available.

## Verification

Run the focused Vitest test, frontend type-check and exact-path lint. For changes that alter
what an administrator sees, add a browser assertion when an authenticated test fixture exists.
