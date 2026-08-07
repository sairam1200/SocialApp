# Services Layer (`src/services`)

This folder is the API and realtime boundary for the frontend.

## What lives here
- `apiClient.service.ts`: central `apiClient` factory (`restfit`)
- `api/*.service.ts`: decorator-based domain services
- `websocket.service.ts`: Socket.IO service singleton + namespace logic

## Rules for contributors
- Backend endpoints MUST be added through domain services in `src/services/api/**`.
- Request/response types MUST be defined or updated in `src/types/**` first.
- Feature code SHOULD call service methods via hooks/components, not raw HTTP.
- Global auth/session behavior MUST be respected (interceptors, token refresh, logout redirect).

## `apiClient` behavior
- Base URL from `NEXT_PUBLIC_API_BASE_URL`
- JSON headers + optional `x-client-origin` in non-production
- Bearer auth from cookie utility
- `wrapResponses: true`
- global interceptors from `src/interceptors/index.ts`

## Service domains
- `TokenService`: auth/session endpoints
- `AccountService`: registration/account lifecycle
- `UserService`: profile/manual social link operations
- `SearchService`: search/trending/suggestions
- `IntegrationsService`: social integration connect/callback/import

## Request flow
1. UI/hook calls `apiClient.<Domain>.<method>()`
2. `restfit` builds request from decorators
3. headers/auth/interceptors are applied
4. feature handles success/error shape

## Critical deviations
- Some areas still have placeholder logic (discover mock mode, social integration disconnect/import edges).
- `src/services/api/index.ts` exports `IntegrationsService` as `Integrations`, while `apiClient` maps it as `Integration`.

## Shared checklists
Use the root README section `Shared checklists`.
