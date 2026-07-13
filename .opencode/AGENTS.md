# gaddr Frontend (SocialApp) — Agent System

## Overview

This project uses a team of specialized sub-agents that collaborate on the gaddr frontend. Each agent has a defined role, scope, and rules. They work together in a structured workflow from architecture to implementation to review to QA.

## Agents

| Agent | Role | Mode | Can Edit |
|---|---|---|---|
| **architect** | Lead software architect | subagent | No |
| **frontend** | Senior Next.js developer | subagent | Yes |
| **ui-tester** | QA + UX engineer | subagent | No |
| **reviewer** | Senior staff engineer | subagent | No |

## Architecture

```
src/
  app/           → Next.js App Router pages and layouts
  components/    → UI components organized by domain
  hooks/         → Custom React hooks
  store/         → Zustand stores (3 stores)
  services/      → API services (restfit) and WebSocket service
  lib/           → Shared libraries (query-keys, discover-cache, db, normalizers)
  providers/     → React provider composition tree
  contexts/      → React contexts (WebSocket)
  types/         → TypeScript type definitions
  utils/         → Utility functions
  constants/     → Application constants
  interceptors/  → REST response interceptors
  features/      → Feature modules (auth)
  actions/       → Next.js Server Actions
```

## Three-Tier Caching Architecture

```
┌─────────────────────────────────────────────┐
│  Tier 1: React Query                        │
│  Server state (API responses)               │
│  60s stale time, 1 retry                    │
│  Key factory: lib/query-keys.ts             │
├─────────────────────────────────────────────┤
│  Tier 2: Zustand                            │
│  Client state (auth, UI, follow)            │
│  3 stores: auth-user, app-ui, follow        │
├─────────────────────────────────────────────┤
│  Tier 3: IndexedDB (Dexie)                  │
│  Persisted discover cache                   │
│  Database: GaddrCache                       │
│  Tables: discoverProfiles, discoverContents │
│  Pattern: stale-while-revalidate            │
└─────────────────────────────────────────────┘
```

## Provider Composition Order

```
QueryProvider (React Query)
  → AccentThemeProvider (theme)
    → AuthHydrationProvider (JWT → Zustand hydration + onboarding guard)
      → HttpContextProvider (server-derived user context)
        → TokenRefreshProvider (automatic token refresh)
          → WebSocketProvider (Socket.IO connections)
            → WebSocketEventHandlers (5 listener hooks)
```

## Collaboration Workflow

### 1. Architecture Phase

```
User Request → architect → Implementation Plan
```

The architect analyzes the requirement, searches the codebase, and produces:
- Root cause analysis (if a bug)
- Architecture plan with file-level changes
- Impact analysis (bundle size, re-renders, RAM, IndexedDB)
- Risks, tradeoffs, recommended implementation order

### 2. Implementation Phase

```
Implementation Plan → frontend → Code Changes
```

The frontend engineer implements the feature following existing patterns:
- Reuses existing components from `components/ui/` and domain directories
- Reuses existing hooks from `hooks/`
- Extends existing Zustand stores (never creates new ones for existing state)
- Extends existing restfit service classes (never creates parallel API clients)
- Uses existing IndexedDB cache (`GaddrCache`) for discover data
- Respects server/client boundary

### 3. Review Phase

```
Code Changes → reviewer → Review Report
```

The reviewer inspects every change for:
- Performance (re-renders, bundle size, React Query misuse)
- Architecture compliance (server/client boundary, caching tiers, provider order)
- Code reuse (no duplicate components, hooks, or state)
- Security (XSS, JWT storage, CSRF)
- Type safety, readability, maintainability
- IndexedDB correctness (using existing Dexie schema)

### 4. QA Phase

```
Code Changes → ui-tester → Test Report
```

The UI/UX tester inspects:
- Every screen in all states (loading, loaded, empty, error)
- All user flows (signup, login, onboarding, profile, settings)
- Accessibility (WCAG 2.1 AA, keyboard navigation, screen readers)
- Responsive layout (desktop, tablet, mobile)
- Visual consistency (dark/light mode, spacing, typography)
- Edge cases (long text, missing images, network errors)

### 5. Iteration

```
Review/Test Report → frontend fixes issues → reviewer/ui-tester re-checks
```

If Critical or Major issues are found, the frontend agent fixes them and reviewer/ui-tester re-check until approved.

## Global Rules

Every coding agent must follow these rules:

1. **Search existing code first.** Use `grep`, `glob`, and `read` before creating anything new.
2. **Explain what existing code is being reused.** List the files and methods you are extending.
3. **Never duplicate business logic.** No parallel implementations of the same logic.
4. **Never create parallel implementations.** Extend existing components, hooks, stores, services.
5. **Preserve backward compatibility.** Existing user flows and API contracts must not break.
6. **Estimate RAM impact.** Every change must estimate memory consumption.
7. **Estimate IndexedDB impact.** Effect on `GaddrCache` database, table sizes, TTL.
8. **Estimate bundle size impact.** New dependencies, chunk sizes, tree-shaking.
9. **Estimate re-render impact.** Component re-render frequency and scope.
10. **Explain tradeoffs.** State what is gained vs. what is lost.
11. **Keep implementations production-ready.** No TODOs, no `console.log`, no hardcoded values.
12. **Prefer extension over replacement.** Rewrite is a last resort.
13. **Follow the existing project architecture.** Next.js App Router, three-tier caching, restfit API client.

## Infrastructure Constraints

| Resource | Limit |
|---|---|
| Server RAM | 512 MB (shared with backend) |
| vCPU | 0.1 (shared with backend) |
| Redis | 30 MB, 30 connections (backend-owned, no direct frontend access) |
| Cloudflare R2 | 10 GB |

## Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Component files | `PascalCase.tsx` | `SearchInput.tsx` |
| Hook files | `use*.ts` | `useFollowUser.ts` |
| Store files | `*.store.ts` | `auth-user.store.ts` |
| Service files | `*.service.ts` | `search.service.ts` |
| Type files | `*.type.ts` or `*.types.ts` | `discover.type.ts` |
| Util files | `*.util.ts` | `cn.util.ts` |
| Constant files | `*.ts` | `globals.ts`, `platforms.ts` |
| Path alias | `@/*` | `@/components/ui/button` |

## Key Files Reference

| Purpose | Path |
|---|---|
| API client | `services/apiClient.service.ts` |
| WebSocket service | `services/websocket.service.ts` |
| WebSocket context | `contexts/WebSocketContext.tsx` |
| WebSocket event handlers | `components/websocket/WebSocketEventHandlers.tsx` |
| React Query key factory | `lib/query-keys.ts` |
| IndexedDB database | `lib/db.ts` |
| IndexedDB cache helpers | `lib/discover-cache.ts` |
| Provider composition | `providers/index.tsx` |
| Auth store | `store/auth-user.store.ts` |
| Follow store | `store/follow.store.ts` |
| App UI store | `store/app-ui.store.ts` |
| Route middleware | `proxy.ts` |
| Interceptors | `interceptors/index.ts` |
| Platform features registry | `lib/platform-features.ts` |

## Invoking Agents

Agents are invoked as sub-agents. Each agent receives the current context and operates autonomously within its scope.

**When to invoke which agent:**

| Situation | Agent |
|---|---|
| Starting a new feature | architect → frontend |
| Bug investigation | architect → frontend |
| UI component creation | frontend |
| Adding new API integration | frontend |
| Code review before merge | reviewer |
| Accessibility audit | ui-tester |
| Responsive design check | ui-tester |
| Performance investigation | architect → reviewer |
| Refactoring plan | architect → reviewer |
| Pre-release QA | ui-tester → reviewer |
| IndexedDB changes | architect → frontend → reviewer |
| WebSocket changes | architect → frontend → reviewer |
