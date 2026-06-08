# Gaddr Frontend v2

Engineering onboarding guide for contributors and interns.

## Branching workflow (read first)
- `main` is production-only and MUST NOT receive direct commits.
- `develop` is the integration branch and MUST NOT receive direct feature commits.
- Every task MUST start from the latest `develop`.
- Before coding, you MUST sync your local `develop` with remote (`checkout develop` -> `pull`).
- Feature work MUST be done on a new branch created from `develop`.
- PRs MUST target `develop` (not `main`).

### Standard flow
1. `git checkout develop`
2. `git pull origin develop`
3. `git checkout -b <type>/<short-description>`
4. implement + commit with conventional prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
5. push branch and open PR into `develop`

## What this project is
- Next.js 16 App Router frontend (`React 19`, `TypeScript`, `Tailwind v4`).
- Core product areas:
  - Auth (email/password + OAuth callbacks)
  - Profile and social account management
  - Discover/search
  - Settings/security
  - Token/session refresh orchestration
  - WebSocket notifications/import channels

## Tech stack
- Framework: `next@16` + App Router
- State: Zustand
- Data fetching/cache: TanStack Query
- API layer: `restfit` + centralized `apiClient`
- Forms/validation: `react-hook-form` + `zod`, `formik` + `yup`
- Realtime: `socket.io-client`
- Media tooling: `@ffmpeg/ffmpeg`, `react-easy-crop`

## Quick start
```bash
yarn install
yarn dev
```

App runs on `http://localhost:3000`.

## Environment variables
Create `.env.local` in repo root.

| Variable | Required | Used in | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `src/services/apiClient.service.ts`, `src/services/websocket.service.ts` | Backend API base URL, e.g. `https://.../api/v1` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Required for signup | `src/app/(auth)/signup/SignupFormClient.tsx` | Cloudflare Turnstile site key |
| `NEXT_PUBLIC_CLIENT_ORIGIN` | Optional | `apiClient` default headers (non-production) | Sent as `x-client-origin` |
| `NEXT_PUBLIC_STORAGE_SECRET` | Optional | remembered users utility | SecureLS key |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Optional | `src/utils/analytics.util.ts` | Placeholder flag for external analytics forwarding |
| `ANALYZE` | Optional | `next.config.ts` | Set `true` to enable bundle analyzer |

## Engineering rules (MUST/SHOULD)

### Architecture boundaries
- Route files in `src/app/**` MUST orchestrate page-level behavior only.
- Reusable UI MUST live under `src/components/**`.
- Stateful side effects and orchestration SHOULD live in `src/hooks/**`.
- Backend requests MUST go through `apiClient` service methods in `src/services/**`.
- Request/response contracts MUST be typed in `src/types/**` before endpoint usage.

### Naming conventions
| Category | Rule |
|---|---|
| Folders/files | MUST use `kebab-case` |
| React components/types | MUST use `PascalCase` |
| Variables/functions | MUST use `camelCase` |
| Hooks | MUST start with `use` |
| Constants | MUST use `UPPER_SNAKE_CASE` |
| Route params | SHOULD match backend/domain naming (`[username]`, `[platform]`) |

### Data and session behavior
- Global auth/session side effects MUST be handled with interceptors/providers, not duplicated per feature.
- New API methods SHOULD be added to the closest domain service (`AccountService`, `UserService`, etc.).
- Features handling authenticated behavior MUST validate expired-token flow (`401` + redirect behavior).

## Architecture you should know first

### Root bootstrap
- `src/app/layout.tsx`
  - Reads `access_token` cookie
  - Decodes JWT
  - Passes auth context into global providers

### Global providers
- `src/providers/index.tsx`
  - `QueryProvider`
  - `AccentThemeProvider`
  - `HttpContextProvider`
  - `TokenRefreshProvider`
  - `WebSocketProvider`
  - `ToasterClient`

### API path (UI -> backend)
1. Components/hooks call `apiClient` (`src/services/apiClient.service.ts`).
2. Request methods are defined in `src/services/api/*.ts` via decorators.
3. Global interceptors in `src/interceptors/*` run for refresh/logout behavior.

### Session and realtime lifecycle
- Token refresh flow: `src/actions/token.actions.ts` + `src/hooks/useTokenRefresh.ts`
- WebSocket service/context: `src/services/websocket.service.ts` + `src/contexts/WebSocketContext.tsx`

## Codebase map
- `src/app`: route entry points and page composition
- `src/components`: shared/feature UI
- `src/services`: API client, API classes, websocket service
- `src/hooks`: feature orchestration
- `src/actions`: server actions
- `src/providers`: app-wide provider composition
- `src/contexts`: websocket context
- `src/store`: Zustand auth state
- `src/types`: payload/domain types
- `src/utils`: cross-cutting helpers

## Route map (high-level)
- Public/auth: `/`, `/login`, `/signup`, forgot/reset/confirm-email, `/onboarding`
- Dashboard: `/discover`, `/bookmarks`, `/u/[username]`, `/settings/**`
- OAuth/integrations: `/oauth-callback/**`, `/integrations/[platform]/callback`
- Utility: `/goodbye`, `/api/ip`

## Critical deviations to know before coding
- `src/proxy.ts` currently has `PROTECTED_ROUTES = []`.
- `src/hooks/index.ts` exports missing files (`useManualProfilesManager`, `useSocialData`).
- Discover/search currently uses mock-heavy mode at route level.
- Social OAuth disconnect path still has placeholder behavior.

## How to add work safely

### Add or change backend endpoint
1. Add or update types in `src/types/**`.
2. Add method in `src/services/api/<domain>.service.ts`.
3. Consume from hook/component (not raw `fetch`, unless external third-party API).
4. Validate interceptor/session side effects.

### Add route feature
1. Add route entry in `src/app/**`.
2. Keep route orchestration in route file.
3. Move reusable UI to `src/components/<feature>`.
4. Move side effects/request logic to hooks/services.

### Add auth-sensitive UI
1. Use `useHttpContext()` for server-hydrated auth context.
2. Use Zustand auth store for client state sync.
3. Verify expired token/logout redirect behavior.

## Shared checklists

### Onboarding checklist
1. Run app locally and verify: login, signup, discover, profile, settings.
2. Read `src/services/apiClient.service.ts` and `src/services/api/*.ts`.
3. Read `src/hooks/useTokenRefresh.ts` and `src/actions/token.actions.ts`.
4. Trace one feature end-to-end (`app` -> `components/hooks` -> `services` -> `types`).
5. Pick one TODO, confirm backend contract, then implement.

### PR checklist
1. Scope: PR does one clear unit of work.
2. Architecture: route/component/hook/service boundaries follow rules above.
3. Types: no untyped request/response payload changes.
4. Session safety: interceptor and auth redirect implications checked.
5. UX states: loading, empty, and error states handled.
6. Docs: update README section(s) when conventions/flows change.
7. Validation: run lint/tests/manual verification relevant to changed area.
