# Agent quality center

The admin route `/admin/evaluation` presents the backend evaluation contract in the product UI.
It is intentionally evidence-first: before a run is submitted, the release state reads
**Not run** and judge-dependent metrics have no fabricated value.

The page consumes the admin-only summary endpoint and shows:

- golden dataset version and case count;
- latest run and observed case count;
- judge configuration state;
- retrieval, grounding, factuality, safety and latency metrics;
- release checks and the current pass/blocked/not-run state.

All copy is in `en.json` and `sv.json`, and the page uses semantic color tokens so blocked and
not-run states remain legible in light and dark themes.

The page does not submit a run itself. CI or a controlled evaluation worker submits bounded
observations to `POST /api/v1/admin/evaluation/run`; this avoids letting a browser invent model
quality evidence. Durable trend history, alerts, human review and deployment automation remain
follow-up integrations around the same contract.

## UI state contract

| Backend state | UI treatment | Meaning |
|---|---|---|
| `pass` | Positive status badge and metric value | Evidence is complete and thresholds passed |
| `fail` | Blocking status badge and metric value | At least one threshold failed |
| `not_run` | Neutral status badge and “Not run” | Evidence is missing; zero is not implied |

The dashboard should remain a transparent report surface. Do not add client-side thresholds,
mocked “latest” runs, automatic retries that hide errors, or a button that submits fabricated
observations. If a new metric is added, update the backend contract, both locale catalogues, the
pure formatting helper test, and this state table together.

## Verification checklist

- Open `/admin/evaluation` with an admin session and confirm the summary endpoint is requested.
- Check pass, blocked, and not-run states with a controlled API fixture.
- Check English and Swedish copy, dark mode, keyboard focus, and mobile width.
- Confirm the page still renders a useful error state when the backend is unavailable.
