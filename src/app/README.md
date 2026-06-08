# App Routes (`src/app`)

This directory owns Next.js App Router entry points: pages, layouts, boundaries, and route handlers.

## Route groups
- `(auth)`: login/signup/password recovery/confirm-email/onboarding
- `(dashboard)`: discover/profile/bookmarks/settings
- public root `/`: `src/app/page.tsx`

## Rules for contributors
- Route files MUST orchestrate page behavior only.
- Reusable UI MUST move to `src/components/<feature>`.
- Async orchestration and side effects SHOULD move to `src/hooks` or `src/services`.
- Auth and redirect behavior MUST stay centralized in `src/proxy.ts` and providers/interceptors.
- New route work SHOULD preserve existing group boundaries (`(auth)` vs `(dashboard)`).

## Global wrappers and boundaries
- Root layout: `src/app/layout.tsx`
- Global boundaries: `src/app/loading.tsx`, `src/app/error.tsx`
- OAuth/integration callback routes live under `src/app/oauth-callback/**` and `src/app/integrations/**`

## Critical deviations (day-1 relevant)
- `src/proxy.ts` currently has an empty `PROTECTED_ROUTES` list.
- `src/app/(auth)/onboarding/page.tsx` still uses placeholder API wiring.
- Discover route currently runs mock-heavy content flow.

## Shared checklists
Use the root README section `Shared checklists` for onboarding and PR expectations.
