# Working alongside other agents and people — frontend

**The protocol is canonical in the backend:**
[`docs/COLLABORATION.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/docs/COLLABORATION.md).
Read it first — five rules, one screen. This file adds only what is specific to this repository,
so there is one protocol rather than two that can drift apart.

> When this was written that file was still uncommitted in the backend working tree, and the
> session authoring it was live — so it was left alone rather than committed on its behalf. It
> pushed its own work shortly after (`6479b5b`), which is the outcome the protocol is designed
> for: waiting cost a few minutes, and nothing had to be untangled.

Announce yourself in [`../AGENT_LOG.md`](../AGENT_LOG.md). Hand over through
[`HANDOFF.md`](HANDOFF.md). Skill `gaddr-collaboration` carries both in loadable form.

---

## The five rules, in one line each

1. **Never run a repo-wide auto-fixer** in a shared tree — `eslint --fix`, `prettier --write`,
   codemods. Name the paths you own.
2. **Stage paths, never `git add -A`.** Account for every line of `git status` before you commit.
3. **Announce yourself in `AGENT_LOG.md`** when you start and when you stop.
4. **Prefer a worktree** for anything spanning more than a few files.
5. **Rebase, then re-run the gate.** Green before a rebase proves nothing about after.

---

## Collision hotspots in *this* repo

Every feature touches these, so two workers will meet here. Touch them briefly, commit them
immediately, and never hold an uncommitted change to one across a long piece of work.

```
src/i18n/messages/en.json     Both locales change on every user-facing string
src/i18n/messages/sv.json     — and they must change together
docs/index.md                 Documentation index — every new doc adds a row
AGENTS.md                     Entry point — every new convention adds a row
src/services/api/*.service.ts restfit clients — every new endpoint adds a method
src/hooks/useCommunity.ts     Query keys and hooks for the whole social layer
package.json                  Dependencies
```

**The translation catalogues deserve their own warning.** They are large JSON files that
*every* feature edits, and a careless formatter rewrites all 1,400 lines. If you add keys with a
script, write it to preserve the file's existing indentation (2 spaces) and key order — an
823-line diff for seven new keys is unreviewable, and it hides whatever else was in it. This
happened here; the fix was to re-checkout and re-apply with `indent=2` and no re-sorting.

---

## Frontend-specific gate facts

`./scripts/ci.sh` is the gate: typecheck → lint → unit → secret scan → build → Playwright.
Two things about it that are not obvious, and both cost a session to learn:

- **Vercel does not gate on types.** `next build` passes green while `tsc` reports errors.
  That is why the script exists at all.
- **The gate could lie, and did.** Step 5 built without `NEXT_PUBLIC_API_BASE_URL`; step 6's
  Playwright build was a Turbopack cache hit, so the browser suite ran against the *earlier*
  bundle. Every one of the 78 tests failed at once and it looked like a feature regression. It
  was a build-cache artefact. Fixed at the root — the API base now defaults to `/api/v1`
  (which `next.config.ts` already rewrites), so an env-less build is a working build.

**If a whole suite fails at once, suspect the harness before the feature.** A real regression
is usually narrow. Total failure is nearly always environment, build or fixture.

---

## When you find someone else's unfinished work

It will happen; it happened twice here in two days. **Do not commit it, and do not finish it.**
Review it, report what you found, stage only your own paths, and record it in
[`HANDOFF.md`](HANDOFF.md) so it is not mistaken for abandoned code later.

The one exception is a change your own work needs to be correct. Make the smallest possible one
and say plainly in the commit message that the surrounding feature is someone else's.

---

## Related

- [`../AGENTS.md`](../AGENTS.md) — entry point and routing
- [`HANDOFF.md`](HANDOFF.md) — current state and what remains
- [`../AGENT_LOG.md`](../AGENT_LOG.md) — who is working on what, right now
- Backend [`docs/COLLABORATION.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/docs/COLLABORATION.md) — the canonical protocol
- Backend [`docs/ENGINEERING_PHILOSOPHY.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/docs/ENGINEERING_PHILOSOPHY.md) — how we build
