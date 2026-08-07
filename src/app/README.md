# App Routes (`src/app`)

This directory owns Next.js App Router entry points: pages, layouts, boundaries, and route handlers.

## Route groups
- `(auth)`: login/signup/password recovery/confirm-email/onboarding
- `(dashboard)`: discover/profile/bookmarks/settings
- public root `/`: `src/app/page.tsx`

## Rules for contributors
- Route files MUST live under `src/app`. See `Reachability` below — this one is enforced by a test.
- Route files MUST orchestrate page behavior only.
- Reusable UI MUST move to `src/components/<feature>`.
- Async orchestration and side effects SHOULD move to `src/hooks` or `src/services`.
- Auth and redirect behavior MUST stay centralized in `src/proxy.ts` and providers/interceptors.
- New route work SHOULD preserve existing group boundaries (`(auth)` vs `(dashboard)`).

## Global wrappers and boundaries
- Root layout: `src/app/layout.tsx`
- Global boundaries: `src/app/loading.tsx`, `src/app/error.tsx`
- OAuth/integration callback routes live under `src/app/oauth-callback/**` and `src/app/integrations/**`

## Reachability — only this directory is routed

`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx` and the
metadata files (`icon`, `opengraph-image`, `sitemap`, `robots`, `manifest`, …) mean something
**only under `src/app`**. The same file anywhere else in `src/` is inert: Next never reaches it,
so it renders for nobody.

It is not harmless, because it still typechecks. On 2026-08-06 `src/contexts/goodbye/page.tsx`
was found to be a byte-for-byte copy of `src/app/goodbye/page.tsx`. Nothing imported it and no
URL served it, but a brand change had to be applied to both files in lockstep to keep
`tsc --noEmit` green — the copy still imported the artwork the change was removing. A second
copy that compiles is worse than dead code: it is a second place you have to remember, and the
build only tells you after you have forgotten.

[`src/route-reachability.test.ts`](../route-reachability.test.ts) enforces two rules:

1. No route-shaped filename outside `src/app`.
2. No file outside `src/app` byte-identical to a routed file — which catches the same copy after
   it has been renamed to something that rule 1 misses.

Both name the offending path and say what to do. If you meant to route the file, move it here;
if it is an ordinary module, rename it.

> Identical files *inside* `src/app` are fine and expected — the six identical `loading.tsx`
> boundaries are correct, because the App Router wants one per segment. Rule 2 only fires when
> the twin is outside `src/app`.

## Critical deviations (day-1 relevant)
- `src/proxy.ts` currently has an empty `PROTECTED_ROUTES` list.
- `src/app/(auth)/onboarding/page.tsx` still uses placeholder API wiring.
- Discover route currently runs mock-heavy content flow.

## Shared checklists
Use the root README section `Shared checklists` for onboarding and PR expectations.
