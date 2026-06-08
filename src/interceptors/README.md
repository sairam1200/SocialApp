# Interceptors (`src/interceptors`)

Global response interceptors used by `apiClient`.

## Files
- `index.ts`: registration order
- `tokenRefresh.interceptor.ts`
- `unauthorized.interceptor.ts`

## Active behavior
- Token refresh interceptor:
  - trigger: `x-token-refresh-required: true`
  - action: calls `triggerTokenRefresh()` client-side
- Unauthorized interceptor:
  - trigger: `401` + `token-expired` header
  - action: logout + redirect to `/login?redirect=<currentPath>`

## Rules for contributors
- Interceptors MUST stay deterministic and lightweight.
- Global session side effects MUST be centralized here/providers, not duplicated per feature.
- New interceptors SHOULD document trigger/action and ordering expectations.

## Shared checklists
Use the root README section `Shared checklists`.
