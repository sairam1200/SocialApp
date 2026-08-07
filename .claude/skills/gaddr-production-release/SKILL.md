---
name: gaddr-production-release
description: Verify and release the public GADDR suite without calling a stale deployment live.
when_to_use: Use for deploy, production, DNS, Vercel, Cloud Build, release, live status, rollback, or a request to publish GADDR Jobs, Search & Me, or Pay.
---

# GADDR production release

Read `docs/PRODUCTION_CONTROL.md` before taking a release action. Then run:

```bash
corepack yarn verify:production
```

The command is intentionally strict. A green local build, pushed commit, Vercel
dashboard or DNS record is not evidence that a public user receives the expected
release. The public endpoint and its version or health contract must agree.

## Release order

1. Run the local gate: `./scripts/ci.sh`.
2. Confirm the actual owner of the Vercel, Cloud Build and DNS accounts. Do not
   deploy from an account that has no GADDR project.
3. Deploy the intended commit through that owner. Record the commit identity in
   `scripts/verify-gaddr-production.mjs` in the same release change.
4. Run `corepack yarn verify:production`. It must pass with no override.
5. Verify the public browser journey that changed. Jobs also requires
   `/api/integration/health` to report `status: ok`.

## Safe failure handling

- TLS hostname failure means DNS or certificate ownership is wrong. Do not
  bypass verification with an insecure client.
- A stale commit means deployment automation is broken. Inspect the GitHub App,
  production branch and deployment queue in the owning Vercel project.
- A missing DNS name means the product stays non-interactive in navigation.
- A degraded cross-product check means the user can receive a partial product.
  Fix the dependency, then repeat the public check.

Never update the expected commit merely to turn a red check green. Update it
only for the commit that was actually deployed and verified.
