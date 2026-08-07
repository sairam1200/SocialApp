# AGENTS.md — Gaddr Search & Me, Frontend

Entry point for Claude and other AI agents. Deliberately short: it routes you to
the authoritative document rather than restating it. Read this, then read the one
file that matches your task.

**Companion repo:** [`TeamGaddr/Gaddr-Search-Me-Backend`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend) — see its `AGENTS.md`, `docs/audit/`, and `docs/roadmap/IMPLEMENTATION_PLAN.md`.
**Full documentation index:** [`docs/index.md`](docs/index.md)

---

## Token and cost control — mandatory

Tokens are paid usage. Work in the smallest sufficient context and stop once the task is proven.

- Read only the files directly relevant to the task; do not bulk-read docs or summarize unchanged code.
- Prefer a single focused agent. Delegate only bounded, independent work.
- Give every sub-agent a narrow deliverable and concise response limit; stop it immediately if it is exploring, repeating itself, or spending tokens without producing task-relevant evidence.
- Do not ask agents for broad plans, alternatives, repository tours, or verbose reports unless explicitly requested.
- Search first, make incremental edits, and run the narrowest relevant verification.
- Return only modified files, concise changes, and required verification. If nothing changed: `No changes required.`

---

## Before you touch anything

**You are probably not alone in this repository.** On 2026-07-26/27 two agent sessions and a
human worked in these trees simultaneously; an `eslint --fix` rewrote someone else's in-flight
files and a `git add -A` swept another's unfinished feature into an unrelated commit. Nothing
was lost, but only by luck.

1. Read [`docs/HANDOFF.md`](docs/HANDOFF.md) — current state, what remains, what is blocked.
2. Read [`AGENT_LOG.md`](AGENT_LOG.md) — is anyone still going, and where?
3. Append your own entry before you start.

Two rules that prevent almost everything: **never run a repo-wide auto-fixer**, and **stage
your own paths, never `git add -A`**. Full protocol: [`docs/COLLABORATION.md`](docs/COLLABORATION.md)
(canonical version in the backend), or load skill `gaddr-collaboration`.

---

## How we build here

**The governing document is [`docs/ENGINEERING_PHILOSOPHY.md`](https://github.com/TeamGaddr/Gaddr-Search-Me-Backend/blob/main/docs/ENGINEERING_PHILOSOPHY.md)
in the backend repo.** It applies to both. In one screen:

1. **Reuse before you build.** Search `components/`, `hooks/`, `utils/` first;
   say what you are reusing. Extend > generalise > new. Never fork logic.
2. **Abstract, generalise, deduplicate.** One concept, one place. The test is
   *when this changes, how many files change?* More than one is a smell.
3. **Make the wrong thing impossible.** Semantic tokens only, so dark mode
   cannot be forgotten. `next-intl` for every string, so a locale cannot be
   half-translated. Money as strings, so precision cannot be lost.
4. **Push work where it happens once.** One `mapPostsAsync` on the server, one
   `PostCard` on the client, one query-key module.
5. **Degrade, don't fail.** A failing feed offers a retry, not a blank screen.
6. **Comment the *why*.** Every rule here was paid for once already.
7. **Prove it reaches the screen.** Vitest for units, Playwright for the gap
   between them — the gap is where the last real bug lived.
8. **The user is not the product's opponent.** The reader picks the feed, the
   algorithm is inspectable, and a disclosure is never hidden.

This repo already carries `formik` **and** `react-hook-form`, `yup` **and**
`zod`, two crop libraries, and Radix **and** Headless UI. Each was one
reasonable local decision. Don't make the next one.

---

## Pick your entry point

Six skills live in [`.claude/skills/`](.claude/skills/). Only their descriptions sit
in context; the body loads when one matches, so **naming the domain in your first
sentence is what makes the right one fire**. Load explicitly with `/skill-name` when
you already know which you need.

| You are doing | Load this |
|---|---|
| Building a page or component, styling, SEO, copy, accessibility | skill `gaddr-frontend-ui` |
| Any user-facing text, a new language, RTL | skill `gaddr-i18n`, plus [`docs/i18n/LANGUAGES.md`](docs/i18n/LANGUAGES.md), the standard shared with Gaddr Jobs |
| Writing a Vitest or Playwright test, or proving a change reaches the screen | skill `gaddr-frontend-testing` |
| Releasing, checking public DNS or deciding whether a product is actually live | skill `gaddr-production-release` |
| The Community feed, post cards, the composer, visibility, the algorithm controls, live, studio, learn | skill `gaddr-community-ui` |
| Agent quality dashboard, evaluation metrics, model or prompt quality status | skill `gaddr-evaluation` and [`docs/evaluation/AGENT_EVALUATION_UI.md`](docs/evaluation/AGENT_EVALUATION_UI.md) |
| Working while someone else is in the tree, committing, rebasing, handing over, finding uncommitted work that is not yours | skill `gaddr-collaboration` |

### Sub-agents

Four in [`.claude/agents/`](.claude/agents/). Delegate when the work would otherwise
flood this conversation, or when you want the constraint enforced rather than merely
requested — `architect`, `reviewer` and `ui-tester` cannot write files at all.

| Agent | Use it for | Writes code |
|---|---|---|
| **architect** | Planning a feature or route, root-causing a UI bug, evaluating a dependency, designing the `[locale]` migration | No |
| **frontend** | Building pages and components, data fetching, styling | Yes |
| **reviewer** | Pre-merge review — hydration, a11y, SEO, i18n, dark mode, bundle | No |
| **ui-tester** | Driving a real browser: both colour schemes, mobile, RTL, console, network | No |

Typical chain: `architect` → `frontend` → `ui-tester` → `reviewer`.

**Backend counterpart:** its `architect`, `backend`, `redis` and `reviewer` agents live
in the other repository with 13 skills of their own. Skills are scoped to the
directory tree they sit in, so neither repo's skills load in the other — if a task
spans both, work in each repo in turn rather than expecting one context to carry both.

Two rules that override instinct here, because both were live bugs:

1. **Colour comes from semantic tokens only** (`bg-background`, `text-foreground`,
   `border-border`). `bg-white` and `text-gray-*` are invisible in dark mode.
2. **Every user-facing string goes through `next-intl`** — add the key to both
   `en.json` and `sv.json`. The default locale is **`sv`**, not English.

---

## Read this first

The cross-repo security audit lives in the backend at
**`docs/audit/2026-07_Security_And_Correctness_Audit.md`**. Findings H3, H4, H5,
M8, M9 and M10 are frontend issues. Read it before touching auth, the edge
middleware, or token handling — it also records plausible bugs that turned out
*not* to be real, so you don't re-investigate settled ground.

Open frontend items:

- **Access tokens are kept in `localStorage`** (`login`, `signup`, `onboarding`,
  all OAuth callbacks), so any XSS is account takeover. The backend already
  accepts `httpOnly` cookies and `proxy.ts` already reads them — the secure path
  exists and is half-wired. Prefer cookies in new code; don't add `localStorage`
  token reads.
- **`proxy.ts` matcher and `PROTECTED_ROUTES` disagree** (finding H4). The matcher
  is what actually runs. `/u/` is listed as protected while being the *public*
  profile page — do not "align" them without reading H4 first, or you will put
  every public profile behind a login.
- **A backend hiccup logs users out** — `verifySession` returns `false` on network
  error, and that path deletes the access-token cookie (H5).

---

## What this is

The web client for **Gaddr Search** (cross-platform social search),
**Gaddr Me** (universal profile) and **Community** (the social layer — feed,
creator economy, livestreaming, learning). Part of the Gaddr family alongside
Gaddr Jobs, Gaddr Pay and Gaddr Chains.

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · TanStack Query v5 ·
Zustand · Radix. Deployed on Vercel, live at `demo.gaddr.com`.

## Structure

```
src/app/            App Router — (auth) and (dashboard) route groups
src/features/       Feature modules (auth, services)
src/components/     Shared UI + svg/ (SVGs compile to React components via svgr)
src/services/       API clients — apiClient.service, websocket.service
src/interceptors/   Token refresh + 401 handling
src/providers/      QueryProvider, ThemeProvider, AuthHydration, TokenRefresh
src/store/          Zustand stores (auth-user, app-ui, follow)
src/proxy.ts        Edge middleware — Next 16 renamed middleware.ts to proxy.ts
src/components/community/  The social layer — feed, cards, composer, live, studio, learn
```

Several directories carry their own README — read the one you are working in:
[`app`](src/app/README.md) · [`services`](src/services/README.md) ·
[`store`](src/store/README.md) · [`interceptors`](src/interceptors/README.md) ·
[`providers`](src/providers/README.md)

## Non-obvious things that will cost you time

| Thing | What to know |
|---|---|
| `src/proxy.ts`, not `middleware.ts` | Next 16 rename. The exported function is `proxy`. Its `config.matcher` is the real gate — code inside it never runs for unmatched paths. |
| **Two theme providers, different jobs** | `ColorSchemeProvider` = light/dark/system, via the `dark` class on `<html>`, set by a pre-paint inline script so there is no flash. `ThemeProvider` = **accent hue** via `data-theme` (default/blue/teal/purple/sunset). Orthogonal — any accent works in either scheme. Controls: `<ColorSchemeToggle />`, `<ColorSchemeToggleCompact />`. |
| Dark mode works, but only for token users | The `.dark` token block was always complete; nothing applied the class until `ColorSchemeProvider` shipped. ~650 hardcoded colour utilities still do not adapt — migrate as you touch files. |
| i18n is cookie-based, not URL-based | `src/i18n/` — registry, request config, `sv`+`en` catalogs, 28 locales registered. Locale comes from the `gaddr-locale` cookie, then `Accept-Language`, then `sv`. **Every locale shares one URL**, which is weaker for SEO; the `[locale]` migration is planned in the implementation plan. |
| SVG imports need the ambient declaration | `src/global.d.ts` declares `*.svg` as a React component. Without it `type-check` reports TS2307 for every icon import, because `next-env.d.ts` is generated and gitignored. **Do not delete it.** Vitest needs its own transform for the same reason — `vitest.config.ts` has one, and without it an icon renders as a URL string and throws `InvalidCharacterError`, which reads like a DOM bug rather than a missing loader. |
| **Search, Explore and Live share one component** | `UnifiedResults` + `UnifiedResultCard` render every result kind from every source. That works only because the API normalises them first. Mode, source, kind and theme filters all live in the URL — do not move them to component state, or a shared link stops meaning what the sender saw. |
| `yarn` only | `packageManager` is `yarn@4.9.2` via corepack. `package-lock.json` is gitignored — do not reintroduce it. |
| Two of everything | `formik` **and** `react-hook-form`; `yup` **and** `zod`; two crop libraries; Radix **and** Headless UI. Prefer `react-hook-form` + `zod` + Radix in new code and migrate opportunistically — don't add to the duplication. |
| Backend proxying | `next.config.ts` rewrites `/api/v1/*` to `AUTH_API_URL`. Same-origin in the browser. |
| **Dotted i18n keys are nesting, not names** | `"visibility.closeFriends"` as a *flat* key never resolves via `t("visibility.closeFriends")` — next-intl reads the dot as a path, finds a string where it wanted an object, and renders the raw key. Nest the group. This was a live bug. |
| **Server components must not use `apiClient`** | It reads a bearer token from `localStorage`, which does not exist during a server render. `lib/community-metadata.ts` fetches anonymously *on purpose* — that is also what keeps a followers-only post out of an Open Graph tag. |

## Error surfaces — all three exist now, and none may leak

`error.tsx`, `not-found.tsx` and `global-error.tsx` are all present. Two of them were
**missing**, and a missing App Router error file is not an error — it is Next.js silently
serving its own page instead:

- **No `not-found.tsx`** meant every 404 got Next's unstyled black-on-white default, English
  only, no way onward, ignoring the dark theme.
- **No `global-error.tsx`** meant an error in the root layout produced a **completely blank
  page**.

Rules that follow:

1. **Never render `error.message` to a user.** Next redacts *server* messages in production
   for this reason; client ones are not redacted. Show `error.digest` as a reference code
   instead — it is the id Next also writes to the server log, and it lines up with the
   `reference` UUID the backend returns on a 500.
2. **`global-error.tsx` must stay dependency-free.** It replaces the root layout, so there is
   no `NextIntlClientProvider` (`useTranslations` would throw), no guaranteed stylesheet, and
   no router — hence inline `<style>`, a `prefers-color-scheme` query, English copy, and a
   plain `<a>` rather than `next/link`.
3. **Build error UI from `components/ui/error-state.tsx`**, and use design tokens. The old
   `error.tsx` used `text-gray-600` on an assumed white background, which is grey-on-near-black
   once dark mode is on.
4. **Never surface a raw API error.** `parseApiError` maps HTTP status onto the `errors`
   translation namespace and vets any server text for stack frames, SQL, connection codes and
   filesystem paths before showing it. A 5xx message is never shown.

## Working rules

1. **Search before creating.** Check `components/`, `hooks/`, `utils/` first.
2. **Server Components by default.** Add `"use client"` only when you need state,
   effects or browser APIs.
3. **Never put browser APIs at module scope in a client component.** Module-level
   code still runs during server rendering — `localStorage` is undefined there,
   and the value is captured once at import, so it goes stale after a token
   refresh. This was a live bug in two OAuth callbacks (finding M9).
4. **TanStack Query owns server state; Zustand owns client state.** Don't cache
   server responses in Zustand.
5. **No `console.log`.** There are already 109; don't add the 110th. `proxy.ts`
   currently logs token presence and length into Vercel production logs — remove
   those if you touch it.
6. **Never expose secrets via `NEXT_PUBLIC_*`.** It is inlined into the client
   bundle. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` must carry HTTP-referrer restrictions.
7. **Add `metadata` to every new route.** Only 5 of 30 routes export it today,
   and SEO is a primary product goal.

### Solo-developer GitHub and production safety

Until the team grows, protect `main` in both GitHub repositories with a pull request requirement
but zero required approvals. Require the frontend typecheck, lint, tests, secret scan, and
production build before merge, keep force-push and branch deletion disabled, and restrict bypasses
to the repository owner. Production deployment must run only from protected `main`, use immutable
commit SHA artifacts, and retain deployable revisions for rollback. Never force-push or delete a
branch to recover from a mistake; revert the commit and preserve the original history.

## Verify your work

```bash
./scripts/ci.sh            # typecheck, lint, unit tests, secret scan, build, Playwright
./scripts/ci.sh --no-e2e   # skip the browser tests while iterating
./scripts/ci.sh --fast     # skip the production build and Playwright
```

This script exists because **Vercel does not gate on types.** `next build` succeeded
green while `yarn type-check` reported 130 errors, so those errors were invisible.
Individually:

```bash
corepack yarn type-check   # must stay at 0 errors
corepack yarn lint
corepack yarn test         # Vitest unit suite
corepack yarn e2e          # Playwright, against a production build
corepack yarn build        # Vercel gates on this
corepack yarn verify:production # public TLS, release identity and integration health
```

**Every one of those six currently fails, and this paragraph used to explain why
backwards.** The committed `yarn.lock` is a Yarn **Classic v1** file while
`packageManager` pins yarn@4.9.2 — and Yarn 4 cannot read a v1 lockfile, so
`corepack yarn <anything>` aborts with `This package doesn't seem to be present in
your lockfile` before it runs a thing. It is yarn 1.x that can read this lockfile and
yarn 4 that cannot, which is the inverse of the advice that stood here.

Until the lockfile is resolved — [`docs/HANDOFF.md`](docs/HANDOFF.md) §3 item 1, a
deliberate decision because it changes what production installs — use
**`./scripts/ci.sh`**, which detects the Classic lockfile and runs the same tools from
`node_modules/.bin`. For one check on its own, call the binary: `npx tsc --noEmit
--skipLibCheck`, `npx vitest run`, `npx eslint "src/**/*.{ts,tsx}"`.

Full background, and the three ways out: [`docs/TOOLCHAIN.md`](docs/TOOLCHAIN.md).

**If you touch `.gitleaks.toml`, run `./scripts/verify-gitleaks-allowlist.sh`.** A green
secret scan proves nothing on its own — gitleaks ignores unknown config keys silently, so
a mis-spelled one turns a narrow exemption into "skip this whole file" without changing the
output. The script plants a credential in each place one could hide and asserts it is still
caught. Rationale, and how to add an exemption: [`docs/SECRET_SCANNING.md`](docs/SECRET_SCANNING.md).

**Check every change in both colour schemes and at mobile width.** The `ui-tester`
agent automates that, including RTL and console/network errors.

### Agent quality surface

The admin quality center lives at `/admin/evaluation`. It consumes the backend release contract;
React must not recalculate pass/fail decisions or turn missing metrics into zero. When changing
this route, verify the `pass`, `fail`, and `not_run` states, both locale catalogues, both color
schemes, and the narrow mobile layout. The page is intentionally read-only; CI or a controlled
evaluation worker submits evidence to the backend.

### Tests exist — and one layer earns its cost

**Vitest 4** covers units (66 tests: locale registry, content normaliser, card helpers, colour-scheme
provider). **Playwright** covers the browser (12 tests — 6 cases in
`e2e/search-aggregated.spec.ts`, run against desktop Chrome and a Pixel 7).

The Playwright suite exists because unit tests on **both** sides of the stack were
green while aggregated search results were saved by the backend, returned by the API,
and never rendered. No unit test could have caught it: every unit was correct and the
gap was between them. If a change affects what a user sees, the assertion belongs
there. Details and constraints in skill `gaddr-frontend-testing`.

**Still uncovered:** the login and profile journeys, and every component outside
search, i18n and theming.

## Branching

[`README.md`](README.md) documents a `develop`-based workflow, but **no `develop`
branch exists** — the remote has only `main` and `staging`. Treat the README's
branching section as stale and confirm the intended flow before relying on it.

---

## Tailwind v4 + shadcn/ui playbook

This is the frontend styling contract. Follow it for every new page, component,
dialog, card, form, and responsive layout. The goal is a coherent product
system, not a collection of locally attractive class strings.

### Project facts

- Tailwind is v4. The source of truth is [`src/app/globals.css`](src/app/globals.css),
  which imports `tailwindcss` and `tw-animate-css`, declares the `@theme inline`
  mappings, and owns the light/dark CSS variables.
- There is intentionally no `tailwind.config.*`. Do not create one to solve a
  one-off styling problem; use Tailwind v4 theme variables or a component-local
  variant instead.
- [`components.json`](components.json) uses shadcn `new-york`, neutral CSS
  variables, RSC-compatible components, and Lucide icons.
- shadcn components are source code owned by this repository under
  `src/components/ui/`. They are not an opaque runtime library.
- The project’s class merger is [`src/utils/cn.util.ts`](src/utils/cn.util.ts),
  imported as `@/utils/cn.util`. Use it instead of creating a second `cn()` helper.
- `ColorSchemeProvider` controls the `.dark` class on `<html>`. The separate
  accent theme uses `data-theme`; do not conflate those two systems.

### Strategic implementation loop

Use this order. It keeps styling decisions cheap and prevents visual rework from
spreading across unrelated components.

1. **Inspect:** search for an existing UI primitive, pattern, token, hook, and
   translation before writing JSX. Reuse the nearest component and extend it
   only when the behavior is genuinely shared.
2. **Define hierarchy:** identify the page surface, primary action, secondary
   action, status, and empty/loading/error states before choosing classes.
3. **Compose:** use a shadcn/Radix primitive for interaction and Tailwind for
   layout, spacing, sizing, and visual variants. Keep business logic out of
   `components/ui`.
4. **Tokenize:** use semantic theme classes first. Add a CSS variable only when
   the value is a real product token used by more than one surface.
5. **Make it responsive:** start at the narrowest supported width, then add
   `sm`, `md`, and `lg` changes only where the layout actually needs them.
6. **Complete the states:** loading, disabled, focus, hover, validation,
   empty, error, long text, dark mode, and reduced motion are part of the UI,
   not follow-up polish.
7. **Prove the screen:** run typecheck/lint and inspect the changed flow in both
   color schemes at mobile and desktop widths. For user-visible behavior, add
   or update a browser assertion when the unit layer cannot see the integration.

### Semantic token rules

Prefer these classes for application surfaces and text:

| Intent | Use |
| --- | --- |
| Page/surface background | `bg-background`, `bg-card`, `bg-popover` |
| Main text | `text-foreground`, `text-card-foreground` |
| Supporting text | `text-muted-foreground` |
| Brand action | `bg-primary`, `text-primary-foreground`, `ring-ring` |
| Secondary action | `bg-secondary`, `text-secondary-foreground` |
| Quiet interaction | `bg-muted`, `bg-accent`, `text-accent-foreground` |
| Structure | `border-border`, `bg-input`, `ring-ring` |
| Destructive action | `bg-destructive`, `text-destructive` |
| Gaddr-specific tokens | `text-gray-neutral`, `text-black-default`, `text-primary-light` |

Rules:

- Never introduce `bg-white`, `bg-black`, `text-gray-*`, or literal hex colors
  for foundational UI. They break the light/dark contract. Existing legacy
  classes may be migrated opportunistically when the file is already in scope.
- Use `text-primary` or `bg-primary` for the brand action, not a hardcoded
  purple. Accent themes must continue to work.
- Use `dark:` only when the design truly changes beyond token substitution.
  Tokens should normally make both schemes work automatically.
- Put new shared colors, radii, or shadows in `globals.css` only after proving
  they are shared. Do not turn every one-off value into a global token.
- Preserve the current font wiring when editing `@theme inline`. Never add a
  circular `--font-sans: var(--font-sans)` declaration, and verify Geist font
  loading after any shadcn or theme migration.

### Tailwind class strategy

- Keep class names statically discoverable. Do not build utilities from partial
  strings such as `` `bg-${color}-500` ``; map approved values to complete class
  strings instead.
- Use `cn()` for conditional classes and `cva` for reusable component variants.
  Keep the base class list readable and put variants near the component that
  owns them.
- Prefer layout primitives over compensating offsets: `grid`, `flex`, `gap`,
  `items-*`, `justify-*`, `min-w-0`, `max-w-*`, and `overflow-*` should explain
  the layout. Avoid chains of `relative`, negative margins, and arbitrary pixel
  nudges unless the visual relationship requires them.
- Use arbitrary values only for a measured design requirement that cannot be
  represented by an existing token or scale. Add a comment explaining the
  constraint when the value is surprising.
- Keep one density system per surface. Comfortable defaults are roughly
  `gap-6`/`p-6`; compact data surfaces are roughly `gap-4`/`p-4`. Do not mix
  unrelated radius families in one component.
- Use `min-w-0` with truncation in flex/grid children, and decide explicitly how
  long titles, emails, URLs, and translated strings wrap.

### shadcn and Radix composition

- Search `src/components/ui/` before adding a primitive. Compose `Button`,
  `Card`, `Dialog`/`AlertDialog`, `Sheet`, `Popover`, `Tabs`, `Table`, `Badge`,
  `Skeleton`, `Alert`, `Label`, and form controls before writing replacements.
- Use `AlertDialog` for destructive confirmation. Use `Dialog` for ordinary
  details or editing. Use `Sheet` when a mobile interaction should slide from
  an edge.
- Preserve Radix keyboard, focus, portal, and escape behavior. Do not replace a
  primitive with a clickable `div` or a custom outside-click implementation.
- Add a new shadcn component only when an existing source component cannot be
  composed cleanly. Inspect the proposed source first; do not blindly overwrite
  local components with CLI output.
- Never run `shadcn init` in this existing project to fix a component. It can
  rewrite `globals.css`, aliases, and font configuration. If the CLI is needed,
  use non-interactive defaults, review the diff, and preserve the project’s
  existing tokens and font setup.
- Prefer the existing Lucide icon set. Icons are supporting content: use quiet
  `size-4`/`size-5` sizing, `aria-hidden` when decorative, and a text label or
  accessible name when they are the only control content.

### Responsive and accessibility baseline

- Build mobile-first. Avoid fixed widths that exceed the viewport; use
  `w-full`, `max-w-*`, `min-w-0`, and responsive grid/flex changes.
- Test at approximately 320px, 375px, 768px, and a desktop width. Check zoomed
  text, long translations, landscape mobile, and keyboard navigation.
- Every interactive element needs real button/link semantics, an accessible
  name, a visible `focus-visible` state, and a disabled/loading state where
  applicable. Keep touch targets around 44px when practical.
- Every input needs a `Label` or equivalent association, an error message tied
  to the field, and an appropriate `autocomplete`, `inputMode`, or type.
- Do not use color alone for status. Pair it with text, an icon, or another
  shape/pattern, and verify contrast in both schemes.
- Respect `prefers-reduced-motion` for nonessential transitions and never make
  an animation the only way to understand state.
- Use logical layout classes (`ms-*`, `me-*`, `start-*`, `end-*`) when a surface
  must support RTL. Avoid hardcoded left/right offsets in shared components.

### UI states and content

- Design the happy, loading, empty, error, retry, disabled, and permission-
  denied states together. A spinner alone is not a loading design.
- Keep async feedback near the action that caused it. Disable duplicate submits,
  preserve user input on recoverable errors, and make destructive actions
  explicit and reversible where the product allows it.
- Route all user-facing copy through `next-intl`; add both `en` and `sv` keys,
  preserving nested key structure. Do not use a class or placeholder as a copy
  fallback.
- Prefer `text-ellipsis`, `truncate`, or controlled wrapping over layout
  breakage. Verify real translated strings rather than only short English text.

### Review checklist before handoff

Before calling a Tailwind/UI change complete, answer yes to these:

- Did I reuse an existing primitive or explain why a new one is necessary?
- Are all foundational colors, borders, rings, and text semantic tokens?
- Does it work in light, dark, and each relevant accent theme?
- Does it survive narrow width, long content, keyboard navigation, and RTL where
  applicable?
- Are loading, error, empty, disabled, hover, and focus states intentional?
- Are strings translated in both catalogs and are icons labeled correctly?
- Did I avoid dynamic class construction, arbitrary offsets, and new duplicate
  utilities?
- Did I run `corepack yarn type-check`, focused lint/tests, and the smallest
  browser check that proves the user-visible behavior?
- Did I append the work to `AGENT_LOG.md` and stage only my own paths?
