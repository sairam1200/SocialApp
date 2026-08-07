# Debug Complete — Root Cause Found and Fixed

## Root Cause

**`mediaFilesRef.current` was stale when `updateMedia` ran, causing every call to wipe Formik's media array to `[]`.**

### The Bug (in `MediaUpload.tsx`)

`processFiles` did two things sequentially:

1. Called `formik.setFieldValue(fieldPath, updatedFiles)` — this is **async** (React state batched)
2. Called `uploadVideoFile(media)` which called `updateMedia()`

`updateMedia` read from `mediaFilesRef.current` which was set during the last render cycle (`mediaFilesRef.current = mediaFiles`). Since Formik's `setFieldValue` is async, the ref still pointed to the **old empty array** `[]`.

Every `updateMedia` call did:
```
[].map(m => m.id === id ? { ...m, ...updates } : m)  →  []
formik.setFieldValue(fieldPath, [])  →  WIPES media to empty
```

This happened on **every** progress update and the final completion — 13+ times in the logs.

### Runtime Evidence

```
[BEFORE updateMedia] { before: null, ... }    ← mediaFilesRef.current was []
[AFTER updateMedia]  { after: null }           ← map([]) produces [], Formik set to []
```

Repeated 13 times. No `[FORMIK MEDIA]` log ever appeared. No `[RENDER BRANCH]` ever fired. The video element never mounted.

## Fix (3 lines added)

**`updateMedia`** — after computing `updated`, sync the ref before calling Formik:

```tsx
const updated = mediaFilesRef.current.map(...);
mediaFilesRef.current = updated;          // ← added
formik.setFieldValue(fieldPath, updated);
```

**`processFiles`** — after building `updatedFiles`, sync the ref before calling Formik:

```tsx
const updatedFiles = [...mediaFiles, ...newMedia];
mediaFilesRef.current = updatedFiles;     // ← added
formik.setFieldValue(fieldPath, updatedFiles);
```

**`handleRemoveMedia`** — same pattern:

```tsx
const updated = [...mediaFiles].filter(...);
mediaFilesRef.current = updated;          // ← added
formik.setFieldValue(fieldPath, updated);
```

## Why This Works

By setting `mediaFilesRef.current` **synchronously** before `formik.setFieldValue` (which is async), the ref is immediately available to any subsequent `updateMedia` calls in the same tick. When `uploadVideoFile` runs synchronously after `processFiles` sets the ref, `updateMedia` now finds the media items in the ref and correctly merges updates.

## Files Changed

- `src/components/create-post/MediaUpload.tsx` — 3 lines added (ref sync), all debug instrumentation removed

## Verification

- TypeScript: 0 errors
- No debug `console.log` statements remain
- All `[DEBUG]` tagged code removed
