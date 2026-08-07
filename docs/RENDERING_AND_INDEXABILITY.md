# Rendering and indexability

What reaches the first HTML response, measured on `demo.gaddr.com`, and the
patterns Gaddr Jobs used to fix the same class of problem.

Written 2026-07-26. The Jobs repo spent an afternoon on this and came out with
one line changed and two written-down "facts" deleted; the useful part is the
method, not the fix.

---

## 1. Measure it correctly, or the number is a lie

```bash
curl -s <url> \
  | perl -0777 -pe 's/<script\b.*?<\/script>//gis; s/<style\b.*?<\/style>//gis; s/<[^>]*>/ /g' \
  | tr -s ' \n' ' ' | wc -c
```

**The `<script>` stripping is the whole point.** The obvious version,
`sed 's/<[^>]*>/ /g'`, removes tags but keeps every script's *contents*, and the
RSC flight payload dwarfs the page. On a Jobs page serving 68 characters of real
text, the naive command reported **27,393**. Measured that way the page looks
healthy and nobody investigates.

Two more, both instant:

```bash
curl -s <url> | grep -c BAILOUT_TO_CLIENT_SIDE_RENDERING
curl -s <url> | grep -o '<script[^>]*type="application/ld+json"' | wc -l
```

Match `ld+json` with a pattern, not a fixed string: attribute order varies once a
CSP nonce is injected.

---

## 2. Where this repo actually stands

Measured against production on 2026-07-26, with the command above:

| URL | Body text | Bailouts | `ld+json` tags |
|---|---|---|---|
| `/` | 58 | 0 | 0 |
| `/discover` | 58 | 0 | 0 |
| `/terms` | 41 | 0 | 0 |
| `/contact` | 29 | 0 | 0 |
| `/u/gaddr` | 17 | 0 | 0 |

**Read the zero in the bailout column.** It is the most informative number here.
It means nothing threw during server rendering: these pages rendered and had
nothing to say, because their data arrives on the client. That is a different
problem from the one Jobs had, and it has a different fix. Do not copy the Jobs
diagnosis; copy the ordering that produced it.

Two more observations from the same pass:

- `/u/gaddr` came back with `robots: noindex, follow` and the title `@gaddr`,
  which is the fallback branch in the profile layout's `generateMetadata`. So
  either that handle does not exist, or `getPublicProfile` could not reach the
  backend from the deployment. Worth confirming with a handle known to exist:
  if it is the backend, every profile is currently shipping `noindex`, and the
  server layout that was built to make profiles indexable is not doing it.
- `sitemap.xml` lists six static pages and **no profiles**. `src/app/sitemap.ts`
  says so deliberately, with a "next step" note. That note is the highest-value
  open item in this repo's SEO surface: profiles are the product's core artifact
  and none of them are enumerated.

---

## 3. What Gaddr Jobs found, and which parts transfer

### The part that is a warning, not a fix

Jobs had every route returning ~66 characters. The cause was one
`next/dynamic(..., { ssr: false })` in the root providers, wrapping `{children}`.
`ssr: false` does not skip a component during server rendering; it **throws**
`BailoutToCSR`, React unwinds to the nearest `<Suspense>`, and with no boundary
before the document root the entire app fell back to client rendering.

That specific bug is **not** present here: this repo's `ssr: false` imports are
scoped to dialogs and page-level components, not to a provider above `{children}`.
The bailout count of 0 confirms it.

What transfers is the failure of reasoning around it. Two explanations had been
written into the Jobs `AGENTS.md` as settled fact:

- *"Every detail page is a client component, so fixing this is a ~136-page
  rewrite."* It was one option in one file, and the detail pages being client
  components turned out not to matter at all.
- *"React 19 never emits `<script type="application/ld+json">` into the initial
  HTML."* This had been probed in three places and none appeared, so it was
  recorded as a framework limitation. Nothing whatever was being server-rendered,
  so no probe could have appeared anywhere.

Both fit every observation. Both were confidently written down. Both were the
same line, and between them they deterred the fix for weeks. **Run the cheap
discriminating check before you write down a cause** — here, `grep -c BAILOUT`,
which takes one second and would have ended both theories immediately.

### The part that applies directly

Next.js **server-renders client components on the first load.** A page being
`"use client"` does not stop its body reaching the HTML. It only fails to do so
when the data is not there during that first render.

So the fix is not a rewrite. It is: read the data in a server component and hand
it to the client component as TanStack Query `initialData`.

```tsx
// a server component (a layout, or a server page wrapping the client one)
const profile = await getPublicProfile(username);
return <ProfileClient username={username} initialProfile={profile} />;

// the client component
const { data } = useQuery({
  queryKey: queryKeys.user(username),
  queryFn: …,
  initialData: initialProfile,
});
```

Four things Jobs learned doing it on three pages:

1. **Derive the seed's type from the fetcher, not by hand.** A shape that is
   close but not identical is worse than no seed, because it only diverges when
   the query refetches, and then the page changes under the reader.
2. **`null` is a seed; `undefined` is not.** TanStack seeds on anything that is
   not `undefined`. Use that to say "this lookup missed" without a round trip.
3. **Read once per request.** Next deduplicates `fetch`, not arbitrary
   functions. If `generateMetadata` and the body both need the profile, wrap the
   read in React's `cache` or you are fetching it twice on every request. This
   repo's profile route has exactly that shape today: `layout.tsx` calls
   `getPublicProfile`, and a seeded page would call it again.
4. **Indexable is stricter than readable.** Emit JSON-LD and index-able metadata
   only for the state you would list in the sitemap. The profile layout already
   does the right thing by falling back to `noindex` — keep that property when
   the body starts rendering, because the body will then be in the HTML too.

### `next/dynamic` on a page whose HTML matters

After Jobs fixed the provider, one page was *still* empty in production while
rendering correctly in dev **and** in a local production build. It was the only
one of three detail pages holding a `next/dynamic` import. The lazy chunk failed
to resolve during SSR on Vercel only, and the failure took the whole route
segment with it, structured data included.

This repo's `/u/[username]/page.tsx` has four `ssr: false` dynamic imports,
including `ProfileSkeleton`, which is on the loading path and therefore the one
most likely to be reached during a server render. Two rules:

- **Never above `{children}`.** Not currently violated here; keep it that way.
- **On a public page, prefer a static import.** A dialog that only opens on click
  is a fair use of `ssr: false`. A skeleton on the render path is not: it is
  small, it has no browser dependency, and it is exactly the component whose
  bailout would empty the page.

Verify any change to those imports against `next build && next start`, never the
dev server. Dev and a local production build both passed while Vercel failed.

### Determinism, which only starts to matter once a body renders

When the server render and hydration produce different text, React discards the
server-rendered subtree — which is precisely the HTML the crawler was handed. In
a product that is localised and RTL-aware, this is not a corner case.

| Hazard | Why it diverges |
|---|---|
| `toLocaleDateString()` with no `timeZone` | Server runs UTC, reader does not. Near midnight it is a different day. |
| `toLocaleString()` on a number with no locale | Server writes `48,000`; a Swedish reader's browser writes `48 000`. |
| Anything reading `Date.now()`, e.g. relative timestamps | Cannot agree, ever. Keep it off server-rendered paths. |

Jobs pinned UTC and an explicit locale in its shared date helper and left ~90
bare call sites as a documented backlog. Doing it before the bodies render is
cheaper than after.

---

## 4. Suggested order of work

Nothing here is a code change made by the Jobs repo; this is the sequence its
own experience suggests, cheapest and most diagnostic first.

1. **Confirm the `/u/<handle>` fallback.** Fetch a handle known to exist. If it
   still returns `noindex`, the backend is unreachable from the deployment and
   every profile is currently non-indexable — that outranks everything else here.
2. **Enumerate profiles in `sitemap.ts`**, per the note already in that file.
   Metadata without a sitemap entry means crawlers have to find profiles by
   link alone.
3. **Seed the profile page** so `/u/<handle>` carries the display name, bio and
   links in the first response rather than 17 characters.
4. **Then `/discover` and `/`**, which are the other two indexable surfaces.
5. **Pin locale and timezone** in shared formatters before step 3 lands, not
   after.

---

## 5. Verification, before calling any of it done

1. Measure with the §1 command against a **production build**.
2. `grep -c BAILOUT` → 0.
3. Count real `ld+json` tags with the pattern, not a fixed string.
4. Load the page and check the browser console for hydration errors.
5. Measure production after deploying. A green dashboard is not evidence that a
   page serves; Jobs confirmed each stage this way and caught the Vercel-only
   failure precisely because production was measured rather than assumed.

---

Counterpart document in the Jobs repo:
`docs/architecture/server-rendering.md`, plus its `gaddr-seo` skill, which is
the same material as a checklist.
