# Handoff — frontend

**Last updated:** 2026-08-01 by Codex.
**State:** source is green and pushed. Public release remains blocked by named infrastructure failures below.

Read this first, then [`COLLABORATION.md`](COLLABORATION.md) before you touch anything, because
more than one worker is active in these repositories.

The admin quality center is available at `/admin/evaluation`. It is a localized, read-only view
of the backend evaluation contract; CI or a controlled worker submits evidence. Missing judge or
metric evidence is shown as **Not run**, not as zero or a fabricated pass. See
[`evaluation/AGENT_EVALUATION_UI.md`](evaluation/AGENT_EVALUATION_UI.md).

## 0. Current public proof, 2026-08-01 13:09 CEST

Run `node scripts/verify-gaddr-production.mjs --strict` rather than trusting this table. It
is the source-controlled live contract and fails until every required endpoint agrees.
(This used to read `corepack yarn verify:production`, which cannot run — §3 item 1.)

| Surface | Observed public result | Meaning |
|---|---|---|
| `https://gaddr.com` | TLS hostname mismatch | The root cannot be called live. Correct the zone target or certificate. |
| `https://demo.gaddr.com/api/version` | `eb738ff`, not frontend `main` | Vercel has not deployed the current frontend. |
| `https://demo.gaddr.com/api/v1/version` | backend revision `gaddr-search-me-backend-00049-5p4` | The API responds, but Cloud Build must expose the source SHA before it can prove the intended commit. |
| `https://jobs.gaddr.com/api/integration/health` | `status: degraded`, Search & Me unreachable | Jobs is public but cross-product integration is not ready. |
| `https://pay.gaddr.com` | no DNS response | Pay must stay non-interactive until a launch owner provisions it. |

The dashboard now includes a single GADDR product switcher on desktop and
mobile. It links Search & Me and Jobs, and labels Pay as in preparation. The
component reads `src/lib/gaddr-products.ts`; do not add a public link before the
production command can prove it works.

---

## 1. Where things stand

| | |
|---|---|
| Frontend `main` | Typecheck ✓, lint ✓ (0 errors), **145/145 Vitest** ✓, secret scan ✓, build ✓ on the final tree. The full gate including **78/78 Playwright** passed at `4d4fff9`; everything after it is markdown, a Vitest timeout constant and one `echo` in `scripts/ci.sh`. Playwright could not re-run on the final tree — a third workspace held the machine at load 120–213, Playwright's `webServer` blew its 300 s budget and left `.next` partial. **Re-run `./scripts/ci.sh` on a quiet machine to close this out** — it now warns when load makes a red result untrustworthy |
| Backend `main` | Green at the last commit I verified. Another session is working in that tree — see §4 |
| Live frontend | **Stale.** `demo.gaddr.com` serves `eb738ff` (2026-07-26 morning). Six later commits have not deployed |
| Live backend | **Current.** It serves endpoints that did not exist before 2026-07-26, so Cloud Build is delivering |
| Branches | `main` and `staging` only, both repos. `staging` fast-forwarded to `main` on 07-27. `git branch -r --no-merged origin/main` is **empty** in both — nothing unmerged anywhere |

Verify any of this in one command, from the backend repo:

```bash
./scripts/verify-deploy.sh
```

## 2. The one blocker: Vercel does not deploy new commits

This is the only thing standing between the work and being live. It cannot be fixed from a
developer machine — it needs the Vercel dashboard or the GitHub App settings.

**What is established:**

- The live frontend advanced from `8e1cbaf` to `eb738ff` on its own during 07-26, so the
  pipeline was working at some point that day.
- Every commit pushed after that produced **no deployment at all**. Three separate watches,
  roughly three hours of polling `/api/version`, returned the same commit *and the same
  deployment id* (`dpl_3at92RMevj3S4Sj6yZ3TtR98rEmq`) every time.
- The backend is unaffected — Cloud Build ships fine. It is Vercel specifically.

**Ruled out already — do not re-investigate:**

| Hypothesis | Why it is not that |
|---|---|
| Wrong branch | The remote has only `main` and `staging`. `eb738ff` (which *did* deploy) is on `main`, and `/api/version` reports `main` as deployed. The commits that will not deploy are on the same branch as the one that did |
| Repo configuration | There is no `vercel.json` |
| The code | Clean `yarn install --immutable` + `next build` succeeds on Node 22; the full gate is green |
| Credentials on this machine | The Vercel token here belongs to a different team (7 projects, none Gaddr). **Do not deploy with it** — it could change what an unrelated production domain serves |

**What to do, cheapest first:**

1. `github.com/organizations/TeamGaddr/settings/installations` — is the Vercel GitHub App still
   installed, and does it still have access to the frontend repository? A revoked or
   repository-scoped installation stops webhooks silently and is by far the most likely cause.
2. Vercel dashboard → the project → *Deployments*. Are builds queued, failing, or absent? Absent
   means the webhook never arrived, which points back to (1).
3. Vercel → Settings → Git → is the production branch still `main`, and is auto-deploy on?
4. If the webhook is dead but the project is fine, a manual redeploy of `main` unblocks
   everything immediately.

Fuller history: backend [`docs/DEPLOY_STATUS_2026-07-26.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/docs/DEPLOY_STATUS_2026-07-26.md).

**Once it deploys**, verify the new surfaces in a browser — they are all client-rendered and
none of them have been seen live yet:

- `/discover?q=design` — tabs **All · For you · Profiles · Contents · Projects**
- `/community/explore` — mode row, source/kind/theme filters, infinite scroll
- `/community/live` — category rail, both orderings
- Any Gaddr Jobs result → the Gaddr mark, and *Open on Gaddr Jobs* reaching the real listing

## 3. What remains, in priority order

Nothing here is half-built. These are next steps, not loose ends.

| # | Item | Where | Notes |
|---|---|---|---|
| 1 | **Decide what the lockfile is** | `yarn.lock`, `package.json` | `yarn.lock` is Yarn **Classic v1**; `packageManager` pins yarn@4.9.2; `.yarnrc.yml` and `.gitignore` are both configured for Yarn 4. So the repo claims Yarn 4 and ships a v1 lockfile, and every `corepack yarn` command fails. `scripts/ci.sh` now falls back to `node_modules/.bin` so the gate runs, but that is a workaround. **The fix is a decision, not a chore** — regenerating re-resolves every dependency, and Vercel picks its package manager from the lockfile *format*, so today it builds with Yarn Classic while the repo says Yarn 4. See the options below the table |
| 2 | **Unblock the Vercel deploy** | Vercel / GitHub App | §2. Everything else is invisible until this is done |
| 3 | **Set `BUILD_SHA` in Cloud Build** | backend `cloudbuild.yaml` | The backend serves but cannot report its commit, so `verify-deploy.sh` shows `?` instead of a verdict. One environment variable |
| 4 | **Seed Community content in production** | backend | Unified search works live but Community posts, profiles and live channels return nothing for most keywords — there is no content yet. Jobs and the aggregated platforms do return. Nothing is broken; the tables are empty |
| 5 | **Access tokens in `localStorage`** | `login`, `signup`, `onboarding`, OAuth callbacks | Audit finding H3: any XSS is account takeover. The backend already accepts `httpOnly` cookies and `proxy.ts` already reads them — the secure path exists and is half-wired. Prefer cookies in new code |
| 6 | **`proxy.ts` matcher vs `PROTECTED_ROUTES`** | `src/proxy.ts` | Audit finding H4. They disagree, and the matcher is what runs. `/u/` is listed protected while being the *public* profile page — **read H4 before "aligning" them**, or every public profile goes behind a login |
| 7 | **A backend hiccup logs users out** | `verifySession` | Audit finding H5: returns `false` on network error, and that path deletes the access-token cookie |
| 8 | **~650 hardcoded colour utilities** | across components | `bg-white`, `text-gray-*` do not adapt to dark mode. Migrate as you touch files; the tokens are complete |
| 9 | **RTL** | across components | ~650 physical utilities (`ml-*`, `left-*`) break Arabic. Move to logical properties before launching `ar` |
| 10 | **`[locale]` URL routing** | `src/i18n/` | Locale is cookie-based, so every language shares one URL — weaker for SEO. Plan in the backend implementation plan |

### Item 1, the three options

Whoever takes this should pick deliberately and verify against a Vercel preview, because the
lockfile is what production installs from.

- **Regenerate with Yarn 4** — `corepack yarn install`, commit the v8 lockfile. Matches the
  repo's stated intent (`.yarnrc.yml`, the berry entries in `.gitignore`, the `packageManager`
  pin) and makes every documented command work again. Costs a full dependency re-resolution and
  flips Vercel onto Yarn 4. **Verify a preview deploy before merging.**
- **Repin `packageManager` to `yarn@1.22.x`** — makes the claim match the lockfile and matches
  what Vercel already does today, with zero re-resolution. Lowest risk, but it freezes the repo
  on an end-of-life Yarn and leaves `.yarnrc.yml` as dead config.
- **Move to npm** — `package-lock.json` is currently gitignored with the comment "Dual lockfiles
  make installs non-deterministic — this repo uses yarn", so this contradicts a stated policy and
  should only happen as an explicit reversal of it, not by drift.

Do **not** resolve it by running `npm install` and committing whatever appears: npm rewrites
`yarn.lock` for the platform it runs on. On this Mac it replaced `@img/sharp-win32-x64` with
`@img/sharp-darwin-arm64`. `scripts/ci.sh` now restores the lockfile after its own install for
exactly that reason.

## 4. Not mine — leave it alone

An uncommitted **provider / OIDC / payment-provider foundation** (~28 files: entities,
repositories, services, a migration `1785000000002-CreateProviderFoundation`, a module, tests,
plus edits to `dependency.ts`, `const.ts`, `app.module.ts`, `configs.ts`) sits in the **backend**
working tree. It was being written while this session closed out — files changed minutes before
I finished.

It is not abandoned code and it is not mine. Do not commit it, do not finish it, do not run a
formatter over that tree. Check [`AGENT_LOG.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/AGENT_LOG.md)
in the backend for whether that session is still going.

That session's protocol, handoff, log and collaboration skill **were** uncommitted while this
was being written; it pushed them itself in `6479b5b`, so every cross-repo link from here now
resolves. Only the provider source files remain uncommitted there.

The general rule, since this will recur: **markdown cannot break a gate, an unfinished
migration and DI wiring can.** If a session genuinely abandons work, recovering its finished
*documentation* on its behalf — attributed in the commit message — is reasonable. Recovering
half-wired source is not.

## 5. What was built in this session

Committed and pushed; all of it covered by tests.

- **Unified search** — one normalised shape for every source, so an "All" tab can exist at all.
  Six sources under `Promise.allSettled`. Ranked by the Community recommender rather than a
  second ranker, so search and the feed agree about what is good.
- **Gaddr Jobs** as a first-class source, read behind `IGaddrJobsRepository` — the seam for a
  future HTTP split. Verified live: real listings with working application links.
- **Search tabs** — All · For you beside Profiles · Contents · Projects. Our own results are
  badged and mixed into Contents, and counted in its total.
- **Explore** (`/community/explore`) — one browsable feed, four orderings, source/kind/theme
  filters, all in the URL so a link means what the sender saw.
- **Live** — category rail, both orderings, theatre mode, share, category links.
- **Inline playback** — ours plays here (`hls.js` on press only); theirs always has a labelled
  route to the original.

Bugs found and fixed on the way, each with a regression test: facet counting made filters a
one-way door; the Explore debounce wrote back a stale URL and undid filters; Vitest had no
`.svg` transform so icons threw `InvalidCharacterError`; and the API base URL became the string
`"undefined"` in any env-less build, sending every request to `/undefined/…`.

## 6. How to pick this up

```bash
cd frontend
git pull --rebase origin main
./scripts/ci.sh                    # ~6 min; must be green before you change anything
```

Then read [`COLLABORATION.md`](COLLABORATION.md), append your entry to
[`../AGENT_LOG.md`](../AGENT_LOG.md), and start at §3 item 1.
