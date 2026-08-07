# Create Post Flow (`src/components/create-post`)

Multi-step post creation UI with platform overrides, media editing, scheduling, and privacy settings.

## Core files
- `index.tsx`: dialog container, steps, Formik state, validation schema
- `ComposeStep.tsx`: platforms + base content
- `CustomizeStep.tsx`: per-platform overrides
- `SettingsStep.tsx`: schedule and privacy behavior
- media helpers/components: upload, crop, trim, adjustments, selection modal

## Rules for contributors
- Step components MUST remain step-focused; cross-step orchestration stays in `index.tsx`.
- Form shape changes MUST update `CreatePostFormValues` and validation together.
- External API usage (location/music suggestions) SHOULD be isolated to utility helpers.
- Final submission logic MUST be implemented through service methods, not inline route calls.

## Media utilities used
- `src/utils/media.utils.ts`:
  - image crop/adjustment helpers
  - FFmpeg video trimming
  - location suggestions (Nominatim)
  - music suggestions (iTunes Search API)

## Critical deviations
- Final publish submit path in `index.tsx` is still TODO.
- Writing assistant UI exists but is not wired to backend generation.

## Shared checklists
Use the root README section `Shared checklists`.
