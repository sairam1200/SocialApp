# Profile Route (`/u/[username]`)

This route owns public/self profile rendering and profile-related dialogs.

## Main files
- `page.tsx`: route container and profile loading
- dialog/components: edit profile, profile picture, share popup, social management, tabs

## Data flow
1. Resolve `username` from route params.
2. Load profile with `apiClient.User.getUserProfileAsync(username)`.
3. Compute self vs guest mode from auth claims and loaded profile id.
4. Render profile sections and route-level actions.
5. Open heavy dialogs via dynamic imports.

## Rules for contributors
- Route MUST remain the orchestration point; reusable UI belongs in `components/`.
- Profile mutation flows MUST update local route state to keep UI responsive.
- Social account actions MUST route through service methods/hooks, not inline duplicated request logic.
- OAuth/manual-link behavior SHOULD remain clearly separated in dialog flow code.

## Critical deviations
- Guest actions (`Follow`, `Message`) are currently UI-only placeholders.
- OAuth disconnect path still has placeholder behavior.
- `AddSocialLinkFlow.tsx` exists but is not part of active route flow.

## Shared checklists
Use the root README section `Shared checklists`.
