# GADDR production control

This repository is the control surface for the public GADDR suite. It does not
combine the product codebases: Jobs, Search & Me and Pay have different release
and data boundaries. It records the exact public contract that makes them one
product family.

Run this before calling a release live:

```bash
node scripts/verify-gaddr-production.mjs --strict
```

The command checks the public TLS connection, frontend and backend release
identities, the Jobs integration health and the Pay DNS endpoint. The expected
release identities are source-controlled in the script. Update them in the same
commit as a deliberate rollout, never to make a failing production check green.

At the 2026-08-01 baseline the command is expected to fail. That is useful:

| Surface | Public evidence | Required fix |
|---|---|---|
| `gaddr.com` | TLS certificate does not cover the hostname | Correct the DNS target or certificate in the account owning the zone. |
| `demo.gaddr.com` web | Serves `eb738ff`, not the source-controlled release | Restore TeamGaddr's Vercel GitHub App or redeploy `main`. |
| `demo.gaddr.com` API | Responds with its deployed revision | Set Cloud Build's release SHA and release the current backend only after its target is confirmed. |
| `jobs.gaddr.com` | Health endpoint says Search & Me is unreachable | Restore the backend endpoint and allow Jobs to reach it, then require `status: ok`. |
| `pay.gaddr.com` | Does not resolve | Provision DNS and a production payment provider only after the payment launch gate is approved. |

The product switcher reads `src/lib/gaddr-products.ts`. A product must remain
non-interactive until this check can prove its public endpoint works.
