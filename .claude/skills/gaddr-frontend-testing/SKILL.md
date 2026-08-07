---
name: gaddr-frontend-testing
description: Testing the Gaddr frontend — Vitest units, Playwright browser tests, the jsdom environment quirks, and choosing which layer a given change needs. Use when adding or changing a test, when a suite fails to start, or when deciding how to prove a change works.
when_to_use: Trigger phrases include "add a test", "write a test", "test this component", "e2e", "Playwright", "Vitest", "browser test", "flaky test", "test times out", "localStorage is not defined", "matchMedia is not a function", "ResizeObserver is not defined", "how do I verify this", and any edit to *.test.ts(x), e2e/*.spec.ts, vitest.config.ts, vitest.setup.ts or playwright.config.ts.
---

# Gaddr frontend testing

Two layers, and the choice between them is not a matter of taste.

| Layer | Runner | For |
|---|---|---|
| Unit | **Vitest** (`src/**/*.test.ts(x)`) | Pure logic, normalisers, hooks, a component in isolation |
| Browser | **Playwright** (`e2e/*.spec.ts`) | Anything a user has to *see* |

```bash
npx vitest run              # Vitest unit suite (re-measure; do not trust a number in prose)
npx vitest                  # watch
npx playwright test         # Playwright, 86 tests (desktop Chrome + Pixel 7) — needs the backend, see below
./scripts/ci.sh             # everything
./scripts/ci.sh --no-e2e    # skip browser tests while iterating
```

> **Not `corepack yarn test`.** `packageManager` pins yarn@4 and the committed lockfile is
> Yarn Classic v1, so every yarn command aborts before running anything. `scripts/ci.sh`
> detects this and falls back to `node_modules/.bin`. Full story in
> [`docs/TOOLCHAIN.md`](../../../docs/TOOLCHAIN.md); the decision that retires it is
> `HANDOFF.md` §3 item 1.

## Why the browser layer is not optional

The defect that broke this product got through every unit test on both sides. The
backend collected content from other platforms, persisted it, and returned it as
`aggregated`; the frontend **dropped the field on the floor**. Results were saved,
served by the API, and never rendered. Every unit test was green.

Then, fixing it, a second bug got through unit tests too: channels were mapped to
`type: 'profile'`, which renders via `ProfileCard` reading `result.publicProfile`. An
aggregated result has no such payload, so the card came out blank with a follow button
that could not work. Playwright caught it; unit tests could not.

The rule: **if a change is meant to put something on screen, a browser test is the only
proof.** A green build is not evidence — `yarn build` passed while `type-check` reported
130 errors.

## Vitest — environment quirks that will cost you an hour

`vitest.setup.ts` handles all of these. Read it before adding a mock.

- **`localStorage` is polyfilled deliberately.** Node 22+ ships an experimental
  built-in `localStorage` that only works with `--localstorage-file`. Without the flag
  Node still *declares* the global, shadowing jsdom's, so `globalThis.localStorage` is
  `undefined` and every access throws. The setup installs an in-memory `Storage` when
  the real one is unusable, which keeps results identical across Node versions.
- **jsdom needs a real origin.** `vitest.config.ts` sets
  `environmentOptions.jsdom.url`; under the default opaque origin the Storage API does
  not exist at all.
- **`matchMedia`, `ResizeObserver`, `IntersectionObserver`** are absent in jsdom and
  polyfilled. Radix (Select, Popover) needs `ResizeObserver`; lazy-loading components
  need `IntersectionObserver`.
- **`mockMatchMedia(prefersDark)` exposes `matches` as a live getter, not a snapshot.**
  `ColorSchemeProvider` calls `matchMedia` once and keeps the `MediaQueryList`, reading
  `.matches` inside its change handler. With a fixed boolean, simulating an OS theme
  change fires the listener but reports the stale value — and the test fails against
  correct code. Use `emitColorSchemeChange(true)` to simulate the change.
- Cleanup runs automatically (`cleanup()`, storage cleared, mocks restored). Do not add
  your own `afterEach` for those.

## Playwright — three settings, each from an observed failure

Do not "optimise" these without reproducing the failure first.

1. **A production build, not a dev server.** `webServer` runs
   `./node_modules/.bin/next build && ./node_modules/.bin/next start --port 3210` with
   `timeout: 300_000` (the build is most of that). Dev mode compiles each route on first
   request, and under two browser projects that contention alone pushed navigations past
   a 30 s timeout. Building once removes the cause rather than absorbing it, and
   exercises the bundle that actually ships.

   Set `E2E_BASE_URL` to skip the `webServer` block and run against an already-running
   server; locally `reuseExistingServer` reuses whatever is on 3210 rather than failing
   on a port clash.

   > It ran `yarn build && yarn start` until 2026-08-06, which could not work: yarn
   > cannot read this repo's Classic lockfile. `scripts/ci.sh` had already been fixed to
   > call binaries directly, but Playwright shelled straight back into yarn — so the gate
   > invoked the E2E step correctly and the step still could not start the app.
   > `src/gate-toolchain.test.ts` now fails if a yarn call reappears here.
   >
   > The prose and the config have disagreed twice now, in opposite directions. Trust the
   > config, fix the prose, and re-measure counts rather than copying them forward.
2. **`fullyParallel: false`, `workers: 1`.** Desktop failed while mobile passed purely
   on scheduling, and the pattern moved between runs. Serially each test takes 2–3 s.
   A flaky e2e suite gets disabled, which is the worst outcome.
3. **Register `waitForResponse` BEFORE `page.goto`.** `goto` resolves on `load`, but the
   search request fires later — after hydration and a 120 ms debounce. Registering
   afterwards races: if the response lands in the gap it is missed and the test waits
   out its full timeout. `gotoSearch()` in `search-aggregated.spec.ts` shows the shape.

Other conventions:

- **Stub the API at the network layer.** `page.route` with a **predicate**, not a glob:
  the request URL depends on `NEXT_PUBLIC_API_BASE_URL` and the query string varies with
  debounce and pagination. `(url) => url.pathname.endsWith('/search/results')` is
  unambiguous. This keeps the suite runnable with no backend or database.
- **Navigate by URL, not by driving the UI.** `/discover?q=<term>` is a first-class
  entry point (the header search bar uses it), so tests exercise a real contract instead
  of coupling to the current search-box markup.
- **Know the roles.** The result tabs are `role="tab"`, not `button` — that mismatch
  cost a debugging cycle. Use `read_page`-style accessibility output or the Playwright
  error context to check before guessing.
- **Filter environmental console noise, not real errors.** Thumbnails point at real CDN
  hosts unreachable from a runner, so image failures are expected; a React render error
  is not. See `isIrrelevantError`.
- **`NEXT_PUBLIC_API_BASE_URL` is pinned to `/api/v1` in `webServer.env`.** Without it
  the client builds request URLs from `undefined` and calls `/undefined/search/results`
  — it neither falls back to the `next.config.ts` rewrite nor fails loudly. Setting it
  explicitly means the suite exercises the same-origin path the browser really uses.
  Note this is a `webServer` env var, so it applies only when Playwright starts the
  server; under `E2E_BASE_URL` the running server's own environment governs.

## Before you believe a red E2E run

**The browser suite needs the backend on `:8080`.** The specs stub the API at the browser
with `page.route`, which is why they are described as runnable with no backend — but the
pages server-render first, and that render calls the API through the `next.config.ts`
rewrite. `page.route` cannot intercept a fetch the Next server makes.

With nothing on 8080 the server logs ~23,800 `ECONNREFUSED`, pages return 500, and **42 of
86 tests fail**. Measured on 2026-08-06 across two commits — merged `main` and the commit
before it — with 41 of the 42 failures identical and the one difference a test flipping
each way. It is a missing prerequisite, not a regression. The backend checkout is
`../backend`.

So, in order, before concluding a red run means broken code:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN    # backend up? if not, 42 failures are explained
uptime                              # load > 2× cores? contention, not defects
grep -c ECONNREFUSED <server log>   # the server's own view
```

Then diff the failing set against the same suite on the previous commit. Identical sets
mean the failures predate you — that comparison is cheap and it is the difference between
"my change broke 42 tests" and "this machine cannot run this suite".

**A whole suite failing at once is nearly always the harness.** A real regression is
narrow. See [`gaddr-collaboration`](../gaddr-collaboration/SKILL.md) for the Turbopack
cache-hit incident where all 78 browser tests failed against a stale bundle.

## What is covered, and what is not

**Covered:** the locale registry and `Accept-Language` resolution (23), the
card helpers — source attribution and licence rendering (14), the
colour-scheme provider including the anti-flash script (18), the aggregated-result
normaliser (11), plus 20 browser tests over aggregated results rendering, the
no-`aggregated` fallback, console cleanliness, mobile overflow, source attribution,
licence rendering and the aggregated result **count**.

Two of those browser tests exist because of defects that unit tests structurally could
not see, both in already-"working" code:

- **`renderPlatformIcon` returned `null`** for any platform with no bundled brand SVG —
  four of the five that actually return data. Every unit test passed; results simply
  rendered with no indication of where they came from.
- **`useSearch` counted only `pagination.contents.total`**, ignoring `aggregated.total`.
  Rows rendered but were not counted, so the tab read "0 contents" above a screenful of
  results — and because that count gates the pagination controls, page 2 was unreachable.

The pattern to take from both: a unit test asserts a function's output, and neither
defect was a wrong output. One was a `null` that was *correct in isolation*, the other a
correct sum of the wrong inputs. Only rendering the page shows it. When you change what
reaches the screen, add the browser assertion — and when a Playwright test fails,
**check the accessibility dump in `test-results/*/error-context.md` before changing the
code**: one of these "failures" was the card truncating a title at 34 characters, which
is the component working as designed and the assertion being wrong.

**Not covered, highest value first:**

1. **Login and signup journeys** — no coverage at all, and it is the highest-risk flow.
2. **Public profile rendering** (`/u/[username]`), including the JSON-LD and metadata.
3. **The 401 → logout interceptor**, which currently logs users out rather than
   attempting a refresh.
4. **RTL layout** — the registry is tested but no browser test loads `ar` and asserts
   the layout mirrors.
5. Component coverage outside search, i18n and theming.

## Writing a test that is worth having

- **Name the behaviour, not the method.** `'renders aggregated content on the Contents
  tab'`, not `'test normalizeGlobalResults'`. The name is what a future reader sees when
  it fails.
- **Prove it can fail.** Break the code, watch it go red, restore it. A test that passes
  against broken code certifies the bug. Done for the token-expiry fix in the backend:
  with the check disabled, 6 tests fail.
- **Assert the user-visible consequence**, not the shape of an intermediate object.
  `normalizeAggregatedResult` is unit-tested for its mapping *and* browser-tested for
  the fact that the mapping reaches a card.
