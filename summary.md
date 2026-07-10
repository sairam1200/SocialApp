# Follow Architecture & Bug Fixes — Session Summary

## ✅ Completed Tasks

### 1. TypeScript Error Fix — Discover Page ✓
`src/app/(dashboard)/discover/page.tsx`:
- Fixed optional chaining on `item.title?.substring()` → uses `.trim()` with null fallback before substring
- Eliminated all TS compilation errors

### 2. ContentFeedCard Source URL Improvements ✓
`src/app/(dashboard)/discover/page.tsx`:
- Added `isValidUrl()` guard — only clickable for `http:`/`https:` URLs
- Conditional `cursor-pointer` class on card wrapper
- `window.open` uses `noopener,noreferrer` for security

`src/components/card/ContentFeedCard.tsx`:
- Wrapped text content section in conditional render (`{textContent && ...}`)
- Prevents empty DOM nodes when title+description are null

`src/types/discover.type.ts`:
- Changed `title: string` → `title: string | null` to match backend contract

### 3. Discover Creators Onboarding Fix ✓
`src/app/(dashboard)/discover/page.tsx`:
- Added `isProfileAvailable` = `!!creator.userName`
- Passes empty `userHandle` and `undefined` `profileHref` for incomplete profiles

`src/components/card/PorfileCard.tsx`:
- New `isProfileAvailable` prop (default `true`)
- When `false`, renders "Onboarding in progress" label
- Hides follow/view buttons for incomplete profiles

### 4. SearchResults Follow Store Sync ✓
`src/components/search/SearchResults.tsx`:
- Seeds `useFollowStore` from `PublicProfileModel.isFollowing`/`followersCount` on mount/results change
- Only writes if entry doesn't already exist (`!useFollowStore.getState().follows[profile.id]`)
- Passes `isProfileAvailable` to `ProfileCard` based on `userName` presence

### 5. Follow Architecture — Phase 1–3 Analysis ✓
Comprehensive system analysis (no code changes):

**Architecture Map** — 7 consumers of follow state:
| Consumer | Location |
|---|---|
| Profile page | `(profile)/u/[username]/page.tsx` |
| Discover creators | `useDiscoverCreators.ts` |
| Profile card | `PorfileCard.tsx` |
| Search results | `SearchResults.tsx` |
| User profile hook | `api/user.hook.ts` |
| WebSocket sync | `useFollowSocket.ts` |
| Optimistic mutation | `useFollowUserMutation.ts` |

**Data Flow**:
- Zustand `useFollowStore` is the single source of truth (keyed by `userId`)
- `useFollowUser` reads store → falls back to props → exposes `toggleFollow`
- `useFollowUserMutation` optimistically updates store, rolls back on error
- `useFollowSocket` (WebSocket) updates store from server `follow.updated` events
- API consumers (`useGetUser`, `useDiscoverCreators`, `SearchResults`) seed store on response

**Root Causes of Stale State**:
1. No cache invalidation for `["follow", "status"]` query key
2. `SearchResults` wasn't seeding the store → follow buttons stale on unmount/remount
3. Parallel API responses can race with optimistic store updates
4. WebSocket only updates store for entries that already exist (missed entries = stale)
5. No cross-tab/broadcast sync — WebSocket is single-connection

## 📝 Modified Files

- `src/app/(dashboard)/discover/page.tsx` — TypeScript fix, sourceUrl handler, onboarding prop
- `src/components/card/ContentFeedCard.tsx` — Conditional textContent render
- `src/types/discover.type.ts` — `title` nullable
- `src/components/card/PorfileCard.tsx` — `isProfileAvailable` prop
- `src/components/search/SearchResults.tsx` — Follow store sync + onboarding prop

## 🚧 Next Steps

### 6. Follow Architecture — Phase 4: Single Synchronization Pipeline ✓

Complete refactoring of the follow state synchronization flow. Created a unified pipeline:

```
API Response → hydrateFollowState() → Optimistic Mutation → WebSocket Reconciliation → Store → UI
```

#### Centralized Hydration Helper
`src/store/follow.store.ts`:
- Added `hydrateFollowState(profile | profile[])` — single entry point for API hydration
- Accepts any object with `id`, `isFollowing`, `followersCount` (duck-typed)
- Handles both single profile and array of profiles
- Built-in null-safety guard before writing to store

#### WebSocket Authoritative Handler
`src/hooks/useFollowSocket.ts`:
- Removed `existingTarget` guard — always writes to store (creates entries for unseen users)
- Never merges or does arithmetic on follower counts — `payload.targetFollowersCount` is authoritative
- When `viewerUserId === currentUserId`: always uses `payload.isFollowing`
- When event is for another user's action: preserves existing `isFollowing`, updates count from payload

#### Consumer Migration
- `src/hooks/useDiscoverCreators.ts` — Replaced inline `setFollow` loop with `hydrateFollowState(profiles)`
- `src/hooks/api/user.hook.ts` — Replaced inline `setFollow` block with `hydrateFollowState(profile)`
- `src/components/search/SearchResults.tsx` — Replaced manual useEffect with `hydrateFollowState(result.publicProfile)`

#### Mutation Hook
`src/hooks/useFollowUserMutation.ts`:
- Optimistic update preserved (immediate UI feedback)
- Rollback on error preserved
- `onSettled` kept as fallback invalidation (when WebSocket fails to deliver)
- Added comment clarifying WebSocket is primary sync mechanism

#### Verified Remaining `setFollow()` Sites (correct usage):
| Location | Purpose |
|---|---|
| `follow.store.ts:53` | Inside `hydrateFollowState()` — the single hydration entry |
| `useFollowSocket.ts:35` | WebSocket authoritative update |
| `useFollowUserMutation.ts:24` | Optimistic mutation |
| `useFollowUserMutation.ts:33` | Rollback on error |

## 🔄 Synchronization Pipeline

```
User Action
    ↓
Optimistic Update (immediate UI)
    ↓
API Request (POST /user/{id}/follow)
    ↓
WebSocket "follow.updated" Event  ←── Authoritative source
    ↓
Store Reconciliation (overwrite, no merge)
    ↓
Query Cache Invalidation (fallback)
    ↓
All UI Consumers Update
```

**Key principles:**
1. `hydrateFollowState()` is the **single** function for seeding the store from APIs
2. WebSocket always **overwrites** — no merging, no arithmetic
3. Mutation `onSettled` is a **fallback** only — WebSocket is primary sync
4. No page-specific fixes — shared infrastructure handles all consumers
