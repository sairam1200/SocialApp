# Providers (`src/providers`)

Global client wrappers are composed here and mounted from `src/app/layout.tsx`.

## Active provider composition
Defined in `src/providers/index.tsx`:
1. `QueryProvider`
2. `AccentThemeProvider`
3. `HttpContextProvider`
4. `TokenRefreshProvider`
5. `WebSocketProvider`
6. `ToasterClient`

Conditional authenticated widgets:
- `WebSocketStatus`
- `WebSocketDebug` (development only)
- `TokenRefreshAnalytics` (development only)

## Rules for contributors
- Each provider MUST have one clear concern.
- Provider order MUST be intentional and documented when changed.
- Client-only providers MUST declare `"use client"`.
- Changes affecting auth/session/realtime MUST be validated end-to-end.

## Critical deviations
- `AuthHydrationProvider.tsx` exists but is not mounted in `src/providers/index.tsx`.
- Flows using `useAuthUserStore().isAuthenticated` must account for current hydration path.

## Shared checklists
Use the root README section `Shared checklists`.
