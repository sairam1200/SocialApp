# Hooks (`src/hooks`)

Feature orchestration hooks used by route and component layers.

## Main hook groups
- search/discovery: `useSearch`, `useTrending`, `useDebounce`
- auth/session: `useTokenRefresh`
- social/OAuth: `useOAuthFlow`, `useOAuthEvents`, `useSocialDialogs`, `useSocialManagerDialogs`
- websocket events: `useNotifications`, `useImports`, `useSessionSecurity`

## Rules for contributors
- Hooks MUST own stateful orchestration and side effects.
- API calls MUST go through `apiClient` services unless calling explicit third-party APIs.
- UI components SHOULD consume hook outputs rather than duplicating side-effect logic.
- Shared logic used by multiple screens SHOULD be extracted into a hook.

## When to create a new hook
1. Multiple routes/components need the same stateful behavior.
2. Logic includes effects, subscriptions, timers, or request coordination.
3. Keeping logic inline would make component reasoning harder.

## Critical deviations
- `src/hooks/index.ts` exports missing files (`useManualProfilesManager`, `useSocialData`).
- `useTokenRefresh` uses module-level coordination state (global per running app instance).
- Discover usage currently runs hooks in mock-heavy mode.

## Shared checklists
Use the root README section `Shared checklists`.
