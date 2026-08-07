# Content Normalizer Fallback Chains

Canonical metadata fallback chains for Search → ContentFeedCard rendering.

- Implemented in `src/lib/resolvers/search-content.resolver.ts`.
- Wired into `normalizeSearchResult()` in `src/lib/card-helpers.tsx`.
- Frontend-only. No backend, DTO, database, Search API, importer or
  ContentFeedCard changes.
- `platformMetadata` on the wire is the backend `metaData` bag — every
  `metaData.*` and `platformMetadata.*` step below reads the same object.
- All legacy mappings are preserved; only fallback steps were appended.
- No `if (platform === ...)` branching anywhere — all compatibility is
  centralized in the resolver.

## Field chains (first hit wins)

| Field | Chain |
|---|---|
| description | `description` → `metaData.description` → `metaData.message` → `metaData.caption` → `metaData.selftext` → `metaData.note` → `metaData.commentary` → `metaData.text` |
| thumbnailUrl | `media.thumbnailUrl` → `thumbnailUrl` → `metaData.thumbnailUrl` → `metaData.imageUrl` → `metaData.coverImageUrl` → `metaData.picture` → `metaData.thumbnail` → `metaData.thumbnails.high.url` → `metaData.thumbnails.medium.url` → `metaData.thumbnails.default.url` → `metaData.images[0].url` |
| displayName | `author.name` → `creator.displayName` → `creatorName` → `metaData.channelTitle` → `metaData.channelName` → `metaData.pageName` → `metaData.username` → `metaData.author` → `metaData.displayName` → `metaData.artists[]` → `"Unknown"` |
| handle | `author.handle` → `creator.handle` → `creatorUsername` → `metaData.channelUsername` → `metaData.username` → `metaData.channelHandle` → `metaData.customUrl` → `metaData.screenName` |
| profileImage | `author.profileImage` → `creator.profileImage` → `creatorAvatar` → `metaData.channelProfileImage` → `metaData.profileImage` → `metaData.avatar` |
| verified | `author.verified` → `creator.verified` → `metaData.verified` → `metaData.isVerified` |
| publishedAt | `publishedAt` → `metaData.publishedAt` → `metaData.createdTime` → `metaData.created` → `metaData.timestamp` → `metaData.createdAt` → `metaData.createTime` → `metaData.createdUtc` → `metaData.releaseDate` (string kept as-is; numeric epoch seconds/ms converted to ISO) |
| viewCount | `engagement.views` → `engagement.viewCount` → `metaData.viewCount` → `metaData.views` → `metaData.analytics.views` → `metaData.analytics.impressions` → `metaData.stats.viewCount` → `metaData.statistics.viewCount` |
| likeCount | `engagement.likes` → `engagement.likeCount` → `metaData.likeCount` → `metaData.likes` → `metaData.analytics.reactions` → `metaData.analytics.saves` → `metaData.stats.likeCount` → `metaData.statistics.likeCount` |
| commentCount | `engagement.comments` → `engagement.commentCount` → `metaData.commentCount` → `metaData.commentsCount` → `metaData.numComments` → `metaData.num_comments` → `metaData.comment_count` → `metaData.analytics.comments` → `metaData.stats.commentCount` → `metaData.statistics.commentCount` → `metaData.replyCount` → `metaData.reply_count` |
| shareCount | `engagement.shares` → `engagement.shareCount` → `metaData.shareCount` → `metaData.shares` → `metaData.analytics.shares` → `metaData.stats.shareCount` → `metaData.statistics.shareCount` → `metaData.retweet_count` → `metaData.quote_count` |
| sourceUrl | `url` → `sourceUrl` → `metaData.youtubeUrl` → `metaData.permalink` → `metaData.link` → `metaData.channelUrl` → `metaData.shareUrl` → `metaData.mediaUrl` → `metaData.media_url` → `metaData.sourceUrl` → `metaData.url` |
| platform | `platform` → `"gaddr"` |

`title` is read from `title` (item level) only; stats below zero are dropped by
`buildEngagementStats`, so a chain hit of `0` is intentionally not rendered.

## Platform coverage (current four)

| Field | YouTube | Facebook | Instagram | Pinterest |
|---|---|---|---|---|
| description | `description` | `message` | `caption` | `description` |
| thumbnailUrl | `thumbnailUrl` / `thumbnails.high.url` | `imageUrl` | `thumbnailUrl` | `imageUrl` |
| displayName | `channelTitle` | — | `username` | — |
| handle | `channelUsername` | — | `username` | — |
| profileImage | `channelProfileImage` | — | `profileImage` | — |
| publishedAt | `publishedAt` | `createdTime` | `timestamp` | `createdAt` |
| viewCount | `viewCount` | — | — | `analytics.impressions` |
| likeCount | `likeCount` | `analytics.reactions` | `likeCount` | `analytics.saves` |
| commentCount | `commentCount` | `analytics.comments` | `commentsCount` | — |
| shareCount | — | `analytics.shares` | — | — |
| sourceUrl | `youtubeUrl` / `channelUrl` | `permalink` | `permalink` / `mediaUrl` | `link` |

## Adding a platform

1. Append the platform's keys to the existing chains above — do not reorder or
   remove existing steps.
2. Document the new keys in this table.
3. Re-run `yarn type-check`, `yarn lint`, `yarn build`.
4. Add a fixture to `scripts/search-metadata-report.ts` and re-run it.
