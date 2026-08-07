# Documentation index — Gaddr Search & Me, Frontend

Every document in this repository, with what it is for and whether it is current.
Start from [`../AGENTS.md`](../AGENTS.md) if you are an AI agent.

**Backend counterpart:** [`TeamGaddr/Gaddr-Search-Me-Backend`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend) → `docs/index.md`
**Cross-repo security audit:** backend `docs/audit/2026-07_Security_And_Correctness_Audit.md` — findings H3, H4, H5, M8, M9, M10 are frontend

---

## 1. Start here

| Document | Purpose |
|---|---|
| [`HANDOFF.md`](HANDOFF.md) | **Open this first.** Current state, what remains in priority order, what is blocked and on whom |
| [`PRODUCTION_CONTROL.md`](PRODUCTION_CONTROL.md) | The public GADDR release contract and the one command that checks it |
| [`COLLABORATION.md`](COLLABORATION.md) | Working while someone else is in the tree — the five rules, this repo's collision hotspots, and what a good pause point is |
| [`TOOLCHAIN.md`](TOOLCHAIN.md) | **Read before running any `yarn` command.** The lockfile is Yarn Classic v1 while `packageManager` pins yarn@4, so every `corepack yarn` command fails — how to run checks today, and the three ways to resolve it |
| [`GATE_ROADMAP.md`](GATE_ROADMAP.md) | What the gate can and cannot prove today, and the ordered path to fixing it — plus the reachability sweep. Verification machinery only; product priorities stay in `HANDOFF.md` §3 |
| [`../AGENT_LOG.md`](../AGENT_LOG.md) | Who is working on what, right now. Append-only. Add your entry before you start |
| [`../AGENTS.md`](../AGENTS.md) | Agent entry point — structure, non-obvious pitfalls, working rules |
| [`../README.md`](../README.md) | Human onboarding — stack, setup, conventions. **Branching section is stale** (see §4) |
| Backend `docs/roadmap/IMPLEMENTATION_PLAN.md` | Cross-repo sequenced plan: what to build next and what is deliberately deferred |
| Backend `docs/audit/2026-07_…_Audit.md` | Verified findings. H3, H4, H5, M8, M9, M10 are frontend |
| [`evaluation/AGENT_EVALUATION_UI.md`](evaluation/AGENT_EVALUATION_UI.md) | Admin quality center: localized evaluation metrics, release status and evidence-first states |

## 1b. Skills and sub-agents

Only each skill's `description` and `when_to_use` sits in context at rest; the body
loads when one matches the task, or on an explicit `/skill-name`.

| Skill | Covers |
|---|---|
| [`gaddr-frontend-ui`](../.claude/skills/gaddr-frontend-ui/SKILL.md) | Design tokens, light/dark, SEO metadata, component conventions, accessibility, avoiding AI-generated design and copy tells |
| [`gaddr-i18n`](../.claude/skills/gaddr-i18n/SKILL.md) | Adding a locale, translating, RTL, formatting, the `[locale]` URL migration, and what Gaddr Jobs learned the hard way |
| [`gaddr-frontend-testing`](../.claude/skills/gaddr-frontend-testing/SKILL.md) | Vitest and Playwright, the jsdom quirks, and which layer a change belongs in |
| [`gaddr-production-release`](../.claude/skills/gaddr-production-release/SKILL.md) | Public DNS, release identity, deploy ownership and live verification |
| [`gaddr-evaluation`](../.claude/skills/gaddr-evaluation/SKILL.md) | Quality dashboard, localized metrics, regression states and evidence-first release UI |
| [`gaddr-collaboration`](../.claude/skills/gaddr-collaboration/SKILL.md) | Parallel work — detecting a live session in the tree, staging your own paths, rebasing, handing over, and why a whole suite failing at once means the harness rather than the feature |
| [`gaddr-reachability`](../.claude/skills/gaddr-reachability/SKILL.md) | Proving a file is reached before editing, trusting or deleting it — only `src/app` is routed, unimported modules, byte-identical copies of pages, and why needing the same edit twice means a duplicate exists |

Sub-agents in [`../.claude/agents/`](../.claude/agents/), with the skills each carries
into its own context:

| Agent | Role | Writes code | Preloaded skill |
|---|---|---|---|
| `architect` | Plans routes and features, root-causes UI bugs, designs migrations | No — `Edit`/`Write` denied | none; loads per domain |
| `frontend` | Builds pages, components, data fetching | Yes | `gaddr-frontend-ui` |
| `reviewer` | Pre-merge review | No — `Edit`/`Write` denied | `gaddr-frontend-ui` |
| `ui-tester` | Drives a real browser — both schemes, mobile, RTL, console, network | No — `Edit`/`Write` denied | `gaddr-frontend-testing` |

All four hold the `Skill` tool, so they can load any of the three on demand. The
read-only three enforce that with `disallowedTools`, not just wording.

> Backend skills live in the other repository and do **not** load here: skills are
> scoped to the directory tree they sit in. If a task spans both repos, work in each in
> turn rather than expecting one context to carry both.

## 1c. Build and CI

| File | Purpose |
|---|---|
| [`../scripts/ci.sh`](../scripts/ci.sh) | Typecheck, lint, unit tests, secret scan, build, Playwright. Exists because Vercel does not gate on types. **Run this, not just `yarn test`** — its build step and Playwright's share a Turbopack cache, and that combination once made all 78 browser tests fail against a stale bundle while every unit test passed. It also carries the Yarn Classic fallback and the lockfile guard — [`TOOLCHAIN.md`](TOOLCHAIN.md) |
| [`TOOLCHAIN.md`](TOOLCHAIN.md) | Why `corepack yarn <anything>` fails, what to run instead, why the gate restores `yarn.lock` after installing, and the three ways to resolve the lockfile |
| [`SECRET_SCANNING.md`](SECRET_SCANNING.md) · [`../.gitleaks.toml`](../.gitleaks.toml) | The secret-scan gate: what is exempt and why, the procedure for adding an exemption, how to triage a finding from entropy alone, and how to audit history without printing a single value. Read before touching the allowlist — gitleaks ignores unknown config keys silently, so a mis-spelled `condition` widens an exemption to the whole file and the scan stays green either way. **The gate scans the working tree only:** 0 findings there, **9 in history** — §6 |
| [`../scripts/verify-gitleaks-allowlist.sh`](../scripts/verify-gitleaks-allowlist.sh) | Proves the allowlist is scoped rather than blanket, by planting a credential in each place one could hide and asserting it is still caught. Sandboxed — never touches the working tree. Run it whenever `.gitleaks.toml` changes |
| [`../playwright.config.ts`](../playwright.config.ts) | Browser tests. Runs against a **production build**, serially with one worker — parallel projects against one dev server produced timeouts unrelated to the code. Builds and starts its own server on port 3210; set `E2E_BASE_URL` to target a running one instead |
| [`../vitest.config.ts`](../vitest.config.ts) · [`../vitest.setup.ts`](../vitest.setup.ts) | Unit tests. jsdom needs a real origin for the Storage API, and the setup polyfills `localStorage`, `matchMedia`, `ResizeObserver` and `IntersectionObserver` |
| [`../e2e/`](../e2e/) | Browser specs. `search-aggregated.spec.ts` is the regression net for aggregated results reaching the UI |
| [`../src/route-reachability.test.ts`](../src/route-reachability.test.ts) | Structural guard, not a component test: no route-shaped file outside `src/app`, and no unrouted byte-identical copy of a routed one. Exists because a duplicate `goodbye/page.tsx` in `src/contexts` compiled fine and forced every brand edit to be made twice |
| [`../src/gate-toolchain.test.ts`](../src/gate-toolchain.test.ts) | Structural guard: while the lockfile is Yarn Classic, no gate entry point may route through `yarn`. Exists because that trap was hit twice — `scripts/ci.sh`, then `playwright.config.ts`'s own web server. Retires itself when the lockfile decision is made |
| [`../src/i18n/`](../src/i18n/) | Locale registry, next-intl request config, message catalogs |
| [`../src/lib/site-config.ts`](../src/lib/site-config.ts) | Canonical origin and SEO defaults — never hardcode a URL |

## 2. Source-tree documentation

READMEs live beside the code they describe.

| Area | Document |
|---|---|
| App Router / routes | [`../src/app/README.md`](../src/app/README.md) |
| API + WebSocket clients | [`../src/services/README.md`](../src/services/README.md) |
| Zustand stores | [`../src/store/README.md`](../src/store/README.md) |
| Token refresh / 401 handling | [`../src/interceptors/README.md`](../src/interceptors/README.md) |
| React providers | [`../src/providers/README.md`](../src/providers/README.md) |
| React contexts | [`../src/contexts/README.md`](../src/contexts/README.md) |

## 3. Feature and session notes

Point-in-time working notes from earlier sessions. Useful as history; **treat as
potentially stale** — verify against source before relying on them.

| Document | Subject |
|---|---|
| [`../SEARCH_INTEGRATION.md`](../SEARCH_INTEGRATION.md) | Search + trending content integration design |
| [`../IMPLEMENTATION_SUMMARY.md`](../IMPLEMENTATION_SUMMARY.md) | Search + trending implementation record |
| [`../QUICK_REFERENCE.md`](../QUICK_REFERENCE.md) | File-location cheat sheet |
| [`../summary.md`](../summary.md) | Follow architecture + bug fixes session |
| [`../DEBUG-HANDOFF.md`](../DEBUG-HANDOFF.md) | A resolved root-cause investigation |

> These five sit in the repository root. They are session artefacts rather than
> maintained documentation — the natural next tidy-up is to fold the durable parts
> into the relevant `src/**/README.md` and delete the rest, so there is one place
> to look per subject.

## 4. Known documentation drift

Recorded so it is not rediscovered.

| Drift | Reality |
|---|---|
| [`../README.md`](../README.md) mandates a `develop` branch, PRs into `develop`, and no direct commits to `main` | **No `develop` branch exists.** The remote has `main` and `staging` only. Confirm the intended flow before relying on the documented one. |
| `src/providers/ThemeProvider.tsx` sounds like it controls light/dark | It does not — it selects one of five **accent colours** via `data-theme`. Light/dark is `ColorSchemeProvider`. Two providers, orthogonal concerns; a user can run any accent in either scheme. |
| ~~`AGENTS.md` said to use `corepack yarn` because "a global yarn 1.x cannot read this lockfile"~~ | **Resolved 2026-08-06 by correcting the document.** It was the exact inverse: `yarn.lock` is Classic **v1**, so yarn 1.x is the only yarn that can read it and the pinned yarn@4.9.2 cannot. Every `corepack yarn` command in that section failed, and the gate reported Typecheck/Lint/Tests as FAILED without running them. Kept here because the wrong explanation is why it survived — readers who hit the error were sent back at the failing command. [`TOOLCHAIN.md`](TOOLCHAIN.md) |
| ~~Docs described Playwright as running a production build while the config ran `yarn dev`~~ | **Resolved 2026-07-25 by changing the config**, which now runs `yarn build && yarn start --port 3210` with a 300 s timeout and pins `NEXT_PUBLIC_API_BASE_URL=/api/v1` in `webServer.env`. Kept here only as a reminder that the prose and the config disagreed for a while, and the config won. |

## 5. Known gaps

Detail in the backend audit, §6 "Gaps against the stated product mandate".

| Gap | Measured state |
|---|---|
| **Tests** | ✅ **227 Vitest unit tests across 40 files + 86 Playwright browser tests** (43 cases across seven specs, run against desktop Chrome and Pixel 7), wired into `scripts/ci.sh`. Unit, typecheck, lint and build measured green on `main` 2026-08-06; **the browser suite needs the backend on `:8080`** and fails 42 of 86 without it — see [`GATE_ROADMAP.md`](GATE_ROADMAP.md). Coverage: locale registry, colour-scheme provider, content normaliser, card helpers, the unified search card and result list, the live directory, the API base URL, and browser specs for the Community feed, error pages, aggregated search and the unified Explore/search tabs. **Outstanding:** no coverage of the login or profile journeys; component coverage outside search, community, i18n and theming is still zero. |
| **Source attribution** | ✅ **Fixed.** `renderPlatformIcon` returned `null` for any platform with no bundled brand SVG — four of the five that actually return data (GitHub, Apple, Openverse, Hacker News). Results rendered with no indication of origin, which for an aggregation product reads as Gaddr's own content. Now a monogram badge plus the full source name in the card footer, so a newly added platform is attributed with no UI change. Openverse `license` and `creator` travel the whole chain: an unattributed CC-BY image is a licence breach, not a cosmetic gap. |
| **Aggregated result count** | ✅ **Fixed.** `useSearch` counted only `pagination.contents.total`, which covers Gaddr-native content and is 0 for essentially every real search, while `aggregated` holds everything collected from other platforms. The tab read "0 contents" above a screenful of results. The count also gates the pagination controls, so a zero hid them and made page 2 of aggregated results unreachable — functional loss, not a wrong label. |
| **Internationalisation** | ✅ **Built.** next-intl 4, `sv` (default) + `en` catalogs, 28 locales registered in `src/i18n/locales.ts`, RTL verified for Arabic. **Outstanding:** locale is cookie-based, so every language shares one URL — weaker for SEO. `[locale]` routing plan in the backend implementation plan. 26 locales still need catalogs, which needs native speakers. |
| **Light/dark mode** | ✅ **Working.** `ColorSchemeProvider` + pre-paint script (no flash) + settings control. The `.dark` token block was always complete; nothing applied the class. **Outstanding:** ~650 hardcoded colour utilities (`bg-white`, `text-gray-*`) still do not adapt — migrate per-component. |
| **SEO** | ✅ **Substantially built.** `robots.ts`, `sitemap.ts`, rich root metadata with title template and OG/Twitter, per-profile `generateMetadata` + `ProfilePage`/`Person` JSON-LD with `sameAs`. **Outstanding:** every route still renders dynamically (`ƒ`) — static/ISR profiles need a paginated indexable-profiles backend endpoint; profiles are not yet in the sitemap. |
| **Bundle duplication** | Unchanged. Two form libraries, two validators, two crop libraries, two UI primitive sets. Six unreferenced dependencies (`secure-ls`, `jsonwebtoken`, `nodemailer`, `reflect-metadata`, `js-cookie`, `init`). Cheapest available performance win. |
| **CI/CD** | ✅ [`../scripts/ci.sh`](../scripts/ci.sh) — typecheck, lint, unit tests, secret scan, build, Playwright. Exists because **Vercel does not gate on types**: `next build` passed green while `type-check` reported 130 errors. **It is also the only gate — this repository has no GitHub Actions workflows.** It was itself unrunnable from a clean clone until 2026-08-06, because it drove everything through `corepack yarn` against a Yarn Classic lockfile; see [`TOOLCHAIN.md`](TOOLCHAIN.md). |
| **Secrets in history** | ⛔ **Open, and it needs a person rather than a commit.** The gate scans the working tree only, and reports 0. Scanning history on 2026-08-07 reported **9 findings across 297 commits**: eight are real credential values committed in `env.local` at `f56433d` (2026-08-03) — including a 101-character platform token — replaced in `9e744ac` but still retrievable by anyone with repository access. **Rotate them.** History rewriting is a separate and much costlier decision. `env.local` is also tracked and not gitignored, so the same thing can happen again. [`SECRET_SCANNING.md`](SECRET_SCANNING.md) §6, [`GATE_ROADMAP.md`](GATE_ROADMAP.md) §2 item 5 |
| **RTL readiness** | ~650 physical CSS utilities (`ml-*`, `left-*`, `text-left`) break Arabic layout. Migrate to logical properties (`ms-*`, `start-*`, `text-start`) before launching `ar`. |

Full sequencing in the backend's `docs/roadmap/IMPLEMENTATION_PLAN.md`.

## 5b. Status and what is next

Snapshot as of **2026-07-27**. The ordered, actionable version — with the one blocker and who it
needs — is [`HANDOFF.md`](HANDOFF.md); this is the summary.

| Area | Status |
|---|---|
| **Community social layer** | ✅ Built and pushed — feed, post cards, composer and scheduling, visibility, algorithm controls, live, studio, learn |
| **Unified search** | ✅ Built and pushed. One normalised shape across Community, Gaddr profiles, live channels, Gaddr Jobs and the external platforms — which is what makes an "All" tab possible. Verified live on the backend |
| **Explore** | ✅ `/community/explore` — four orderings, source/kind/theme filters, all in the URL |
| **Live** | ✅ Category rail, both orderings, theatre mode, share |
| **Frontend gate** | ✅ `./scripts/ci.sh` green end to end |
| **Live deployment** | ⛔ **Blocked.** Vercel has not deployed any commit since `eb738ff`; the backend deploys fine. Needs the Vercel dashboard or the GitHub App settings — not fixable from a developer machine. See [`HANDOFF.md`](HANDOFF.md) §2 |
| **Auth hardening** | ⏳ Audit findings H3/H4/H5 open — tokens in `localStorage`, the `proxy.ts` matcher disagreement, and a network error logging users out |
| **Dark mode / RTL** | ⏳ ~650 hardcoded colour utilities and ~650 physical CSS utilities remain. Migrate as you touch files |

## 6. Conventions for adding documentation

- **Area docs live beside the code** (`src/**/README.md`) so they are reviewed in
  the same diff. Cross-cutting documents live here in `docs/`.
- **Add every new document to this index.** An unlisted document is one an agent
  will not find.
- **Don't create root-level session summaries.** Fold findings into the relevant
  area README, or into `docs/` if they span areas — §3 is the backlog that
  practice created.
- **When code contradicts a document, fix the document in the same change** — or
  record it in §4.
