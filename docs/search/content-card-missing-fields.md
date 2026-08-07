# Content Card Missing Fields Report

Generated: 2026-08-01 · Source: Search Runtime Audit · Version 1

Scope: canonical rendering fields for `ContentFeedCard` (search path only). Backend APIs are **not** modified — this report is advisory.

## 1. Missing mappings (structural, all platforms)

| Field | Status | Where it breaks | Recommendation (report-only) |
|---|---|---|---|
| `creator.verified` | **Always `false`** for unlinked/imported creators | `VerifiedIcon` never renders for platform content | `ContentStreamSearchRepository` already computes `verified` (`row.creatorVerified \|\| meta.verified`); propagate it into `IndexDocument.verified` → `SearchResult` top-level and have `ResolvedCreatorIdentity` inherit it on the `IMPORTED_METADATA` path instead of hardcoding `false` (`creator-identity-resolver.service.ts:73`). No DTOs removed. |
| `sourceUrl` | Not a top-level `SearchResult` field | Relies on `platformMetadata.sourceUrl ?? platformMetadata.url` | Add optional `sourceUrl` to `SearchResult` (additive). |
| `shareCount` | Not written for most platforms | "shares" stat never renders | See per-platform table below. |

## 2. Fields always null / empty in practice

- **`verified`** — all platforms: `creator.verified` is `false` on the `IMPORTED_METADATA` and `USER_PROFILE` resolver paths unless a gaddr linked account exists. Even when `metaData.verified` is `true`, the resolver drops it.
- **`profileImage`** — instagram, facebook, linkedin, reddit, pinterest, spotify, threads: the importers do not persist a creator avatar (`creatorAvatar`/`channelProfileImage` are not written), so `profilePicSrc` falls back to `null` (avatar shows initial fallback).
- **`handle`** — facebook, pinterest, linkedin, spotify: no `username`/`screenName`/`handle` is persisted, so `userHandle` renders `undefined`.
- **`engagement.viewCount`** — instagram, facebook, spotify, threads: no view count source.

## 3. Fields using legacy fallbacks (frontend `search.normalizer.ts` / `card-helpers.tsx`)

| Field | Primary | Fallback chain (still active) |
|---|---|---|
| `author.name` | `creator.displayName` | `creatorName` → `platformMetadata.channelName` → `channelTitle` → `author` |
| `author.handle` | `creator.handle` | `creatorUsername` → `platformMetadata.channelUsername` → `channelHandle` → `username` → `customUrl` → `screenName` |
| `author.profileImage` | `creator.profileImage` | `creatorAvatar` → `platformMetadata.channelProfileImage` → `avatar` → `profileImage` |
| `url` | `platformMetadata.sourceUrl` | `platformMetadata.url` (then card guards `http(s)://` before navigating) |
| `imageSrc` | `thumbnailUrl` (new) | `mediaUrl` — **changed 2026-08-01**: previously `mediaUrl` was preferred; now thumbnail-first so non-playable `mediaUrl`s no longer produce the "Image unavailable" placeholder |
| `description` | `SearchResult.description` | `platformMetadata.description` → `caption` → `summary` → `commentary` → `text` |

## 4. Platform-specific gaps

| Platform | Missing / weak | Notes |
|---|---|---|
| youtube | `shareCount` missing; `verified` always false | Engagement counts require `videos.list` enrichment (search.list returns 0). |
| instagram | `viewCount`, `profileImage`, `shareCount` | Import writes `likeCount`/`commentsCount`/`reach`/`saved`; views not persisted. |
| facebook | `viewCount`, `handle`, `profileImage`, `verified` | `message` doubles as title+description. |
| tiktok | `verified` | All canonical content fields populated; icon exists. |
| twitter/x | `viewCount` uses impressions only when present; `profileImage` missing | `replyCount` maps to comments, `repostCount`/`quoteCount` to shares. |
| linkedin | `thumbnailUrl`, `profileImage`, `handle`, `sourceUrl` | Post has no media thumbnail; `author` is an object not a display name. |
| reddit | `viewCount`/`likeCount` are score-based approximations; `profileImage`, `shareCount` | `score` ≠ views/likes; render is semantically approximate. |
| pinterest | `commentCount`, `shareCount`, `handle`, `profileImage`, `verified` | `analytics.saves` approximates likes. |
| spotify | `viewCount`, `likeCount`, `commentCount`, `shareCount`, `handle`, `profileImage` | `publishedAt` from `releaseDate` may be year-only (renders `1/1/<year>`). |
| threads | `thumbnailUrl`, `viewCount`, `shareCount`; **no importer** | Placeholder search only — no rows indexed. |
| snapchat | — | Fallback response only; no importer, no data. |
| behance | — | Fallback response only; no importer, no data. |

## 5. Platform icon coverage (`renderPlatformIcon`, `card-helpers.tsx`)

Icons exist for: youtube, facebook, instagram, pinterest, twitter/x, linkedin, tiktok.
**No icon** (renders `null`): reddit, spotify, threads, snapchat, behance.

## 6. MetaData written but unused

- youtube: `isShort`, `duration`, `statistics`, `playlistId`, `itemCount`, `videoDescription`
- instagram: `mediaType`, `reach`, `saved`
- facebook: `analytics.engagement`
- tiktok: `duration`, `videoDuration`, `height`, `width`
- twitter: `editHistoryTweetIds`
- linkedin: `visibility`, `distribution`, `content`, `activity`, `lastModified`
- reddit: `subreddit`, `upvoteRatio`
- pinterest: `boardId`
- spotify: `popularity`, `durationMs`, `totalTracks`, `owner`, `uri`, `href`, `externalUrls`

Full inventory: `content-platform-metadata-keys.json`.

## 7. Which platforms cannot populate which canonical fields (summary)

| Platform | Cannot populate |
|---|---|
| facebook | viewCount, handle, profileImage, verified |
| instagram | viewCount, profileImage, shareCount, verified |
| linkedin | thumbnailUrl, handle, profileImage, sourceUrl, verified |
| reddit | viewCount, likeCount (approximated by score), profileImage, shareCount |
| pinterest | commentCount, shareCount, handle, profileImage, verified |
| spotify | all engagement counts, handle, profileImage, verified; publishedAt year-only |
| threads | thumbnailUrl, viewCount, shareCount + **no data at all** (no importer) |
| snapchat | everything (fallback only) |
| behance | everything (fallback only) |

## 8. Recommended backend fields (advisory — no backend changes made)

1. Add top-level `SearchResult.sourceUrl` (canonical, additive).
2. Propagate `IndexDocument.verified` to `ResolvedCreatorIdentity` on the imported-metadata path.
3. Persist `creatorAvatar`/`username` for instagram/facebook/pinterest/linkedin importers.
4. Persist `viewCount` for instagram (from `reach`) and facebook (reactions proxy unavailable).
5. Standardize `metaData` keys across importers to the `normalizeMetaData` output shape (see `content-platform-metadata-keys.json`) so read side never depends on provider-specific spellings.
