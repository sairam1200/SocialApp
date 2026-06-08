# Store (`src/store`)

Zustand global state for authenticated user data.

## Current store
- `auth-user.store.ts`
- state: `authUser`, `isAuthenticated`
- actions: `setAuthUser`, `updateAuthUser`, `clearAuthUser`

## Rules for contributors
- Store MUST keep shared app state only; avoid duplicating local component state.
- Store updates SHOULD remain minimal and predictable.
- Flows relying on persisted browser state MUST account for `clearAuthUser()` behavior.

## Critical deviations
- `clearAuthUser()` currently calls `localStorage.clear()` (clears all keys, not only auth keys).
- `AuthHydrationProvider` is not mounted globally, so hydration path must be validated per auth flow.

## Shared checklists
Use the root README section `Shared checklists`.
