# Contexts (`src/contexts`)

React context providers, and nothing else. Two live here:

| File | Consumed by |
|---|---|
| `WebSocketContext.tsx` | `src/providers/index.tsx`, eight `src/hooks/use*Socket.ts`, the two `src/components/websocket/` components |
| `BookmarkContext.tsx` | `src/app/(dashboard)/layout.tsx`, `src/components/bookmarks/BookmarkToggle.tsx` |

**No routes.** Until 2026-08-06 this directory also held `goodbye/page.tsx`, a byte-for-byte
copy of the routed `src/app/goodbye/page.tsx`. Nothing imported it and the App Router never
reached it — only `src/app` is routed — but it still compiled, so a brand change had to be
made in both files at once to keep `tsc --noEmit` green. It is deleted, and
[`src/route-reachability.test.ts`](../route-reachability.test.ts) now fails if a route-shaped
or duplicated file reappears anywhere outside `src/app`. Background:
[`src/app/README.md`](../app/README.md) → *Reachability*.

## `WebSocketContext.tsx` provides
- Socket service instance access
- Namespace sockets: `notifications`, `imports`
- Connect/disconnect helpers
- Per-namespace connection status

## Rules for contributors
- Context providers MUST expose stable, minimal APIs.
- Namespace connection logic SHOULD stay centralized in context/service.
- Feature code MUST consume sockets via hooks (`useWebSocket`, `useNotifications`, etc.), not ad-hoc socket instances.

## Runtime behavior
- Initializes `WebSocketService` on client only.
- Auto-connects namespaces when auth state and token prerequisites are satisfied.
- Emits `join` after backend `connected` event.
- Disconnects sockets on cleanup/logout conditions.

## Critical deviations
- Auto-connect depends on Zustand auth store hydration path; validate auth state source when debugging socket issues.

## Shared checklists
Use the root README section `Shared checklists`.
