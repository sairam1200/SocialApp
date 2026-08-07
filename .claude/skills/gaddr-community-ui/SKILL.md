---
name: gaddr-community-ui
description: The Community client — the feed and its two modes, post cards, the composer, visibility and disclosure UI, the algorithm controls, profiles, live playback, the creator studio and learning. Use when building or debugging anything under src/components/community/ or src/app/(dashboard)/community/.
when_to_use: Trigger phrases include "the feed", "For You", "Latest", "post card", "the composer", "reply", "repost", "poll", "story", "disclosure badge", "paid partnership", "who can see this", "close friends", "why am I seeing this", "feed settings", "algorithm controls", "creator studio", "go live", "stream key", "OBS", "course", "certification", "explore", and any edit under src/components/community/, src/app/(dashboard)/community/, src/hooks/useCommunity.ts or src/types/community.type.ts.
---

# Community UI

**Backend counterpart:** skill `gaddr-community` and
`docs/social/ARCHITECTURE.md` in the other repository. Skills are scoped to
their directory tree, so neither loads in the other — work in each repo in turn.

---

## Where things live

| Concern | File |
|---|---|
| Types mirroring the API | `src/types/community.type.ts` |
| API client | `src/services/api/community.service.ts` |
| Queries, mutations, engagement reporting | `src/hooks/useCommunity.ts` |
| One card for every post kind | `src/components/community/PostCard.tsx` |
| One composer for every post kind | `src/components/community/Composer.tsx` |
| The two feeds and the tab | `src/components/community/CommunityFeed.tsx` |
| Algorithm controls | `src/components/community/FeedSettings.tsx` |
| Server-side metadata reads | `src/lib/community-metadata.ts` |

---

## The rules that are not negotiable

### One card, one composer

`PostCard` renders updates, photos, videos, stories, polls, comments, reposts,
quotes, lives and clips. They differ by which optional block is present, not by
which component was chosen. This mirrors the single `posts` table on the server
and is what stops the like button behaving differently on a photo than a poll.

Same for `Composer`: text, media, poll, place, product, schedule, visibility,
disclosure and simulcast targets are one form. Five forms would each forget
something different.

### The disclosure label is never conditional on layout

`DisclosureBadge` renders above the body, at full contrast, never behind a
"more" affordance, whenever `post.disclosure !== "none"`. Asserted in both the
unit and browser suites. If a redesign makes it collapsible, the redesign is
wrong.

### The feed mode lives in the URL

`?feed=latest`. A reader who prefers chronological can bookmark it and it
survives a reload. A preference that only lives in component state is one the
product keeps overriding.

### A poll hides its results until the reader votes

Showing the tally first anchors the answer. `PostPoll` gates on
`viewerOptionId || isClosed`.

### Never render a post body as HTML

`PostBody` splits on a pattern and renders links as elements.
`dangerouslySetInnerHTML` on a post body is an XSS in a social feed — the worst
place to have one. There is a test asserting markup in a body stays text.

---

## Data

**Query keys come from `communityKeys`.** Never inline an array. A mistyped key
means an invalidation silently misses a cache, which is the most common way a
social UI shows a stale like count.

**Optimistic reactions patch every cache that holds the post** — feed pages,
profile timelines, threads and single-post queries — via
`patchPostEverywhere`. Patching only the visible one makes two screens
disagree. `onError` restores the whole snapshot; a partial rollback is worse
than none.

**Impressions are batched.** `useEngagementReporter` buffers, flushes on a
timer and on `visibilitychange`, and reports one impression per post per mount.
A feed page is twenty cards; twenty requests per scroll would cost more than
the feed.

An impression fires at **50% visibility**, not on mount. "Rendered" is not
"seen": a card below the fold that is never scrolled to would otherwise teach
the ranker about something nobody looked at.

**Money is a string.** `formatMinor` converts for display. Never `Number` a
minor-unit value — precision is lost past 2^53, and this is a creator's
earnings.

---

## Server components

**Do not use `apiClient` in one.** It reads a bearer token from `localStorage`,
which does not exist during a server render, so it silently produces anonymous
requests anyway.

`lib/community-metadata.ts` fetches **anonymously on purpose**, with a 3-second
timeout. That is not a limitation — it is the mechanism: the API's own
visibility rules decide what exists, so a followers-only post 404s and the page
falls back to generic metadata with `noindex`. Nothing restricted can reach an
Open Graph tag.

`lib/server-session.ts` decodes the cookie locally and makes **no network
call**. It is a rendering hint, never an authorisation check — every real
permission is enforced by the API.

---

## i18n

**Dotted keys are a nesting path, not a name.** A flat key literally called
`"visibility.closeFriends"` never resolves through `t("visibility.closeFriends")`
— next-intl walks the dot, finds a string where it wanted an object, and
renders the raw key. This was a live bug; the four groups (`visibility`,
`disclosure`, `reason`, `source`) are now nested objects.

Every string goes in **both** `en.json` and `sv.json`. The default locale is
`sv`.

A new ranking reason needs `community.reason.<source>` in both, or the "why
this post" sheet shows a raw key.

---

## Proving it

```bash
corepack yarn type-check     # 0 errors
corepack yarn test           # Vitest
corepack yarn e2e            # Playwright, against a production build
./scripts/ci.sh              # the whole gate
```

The browser suite is where Community's real risks live, because they are all
gaps *between* correct units:

- the tab not changing the requested `mode`;
- the disclosure label not rendering;
- a poll showing results before a vote;
- a hydration mismatch or a missing i18n key (both surface as console errors,
  and `community-feed.spec.ts` asserts there are none).

Check both colour schemes and mobile width. Colour comes from semantic tokens
only — `bg-white` and `text-gray-*` are invisible in dark mode.
