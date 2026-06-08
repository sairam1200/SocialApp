# Contexts (`src/contexts`)

This folder currently contains WebSocket application context.

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
