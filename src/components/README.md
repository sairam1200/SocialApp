# Components (`src/components`)

Reusable and feature UI lives here. Organization is by domain, not by route.

## Current organization
- `ui/`: shared primitives
- `authentication/`: auth-specific UI
- `navigation/`, `layouts/`: app chrome
- `manage-social/`: linking/import dialogs
- `create-post/`: multi-step post workflow
- `search/`: search/trending UI
- `dialog/profile-settings-dialogs/`: settings/security dialogs
- `analytics/`, `websocket/`: diagnostics and runtime panels
- `landing-page/`: marketing sections
- `svg/`: icon components

## Rules for contributors
- Generic primitives MUST go into `ui/`.
- Feature-specific UI MUST stay in feature folders.
- Route orchestration MUST stay in `src/app`, not component folders.
- Components SHOULD receive data/actions from hooks/services instead of owning API calls.
- Component props MUST be typed; avoid implicit `any`.

## Critical deviations (day-1 relevant)
- File typo exists and is used: `src/components/card/PorfileCard.tsx`.
- Some flows remain intentionally incomplete (`create-post` publish path, parts of social/settings integration).

## Related docs
- `src/components/analytics/README.md`
- `src/components/create-post/README.md`
- Root README section `Shared checklists`
