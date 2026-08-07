---
name: gaddr-frontend-ui
description: Build UI in the Gaddr frontend — design tokens, light/dark mode, SEO metadata, component conventions, accessibility, and avoiding AI-generated design tells. Use when adding a page or component, styling anything, writing user-facing copy, or working on the landing page or dashboard.
when_to_use: Trigger phrases include "add a page", "new route", "build a component", "style this", "make it look", "dark mode", "the text is invisible", "add metadata", "SEO", "sitemap", "robots", "JSON-LD", "accessibility", "aria", "contrast", "focus ring", "landing page", "dashboard", "write the copy for", "search results card", and any edit under src/app/ or src/components/.
---

# Gaddr frontend UI

Next.js 16 App Router · React 19 · Tailwind v4 · Radix · TanStack Query v5 · Zustand.

## Colour: use tokens, never raw colours

`src/app/globals.css` defines a complete semantic token set in `:root` and `.dark`.
Tailwind maps them via `@theme inline`, so token-based utilities adapt to light and
dark automatically.

**Use:** `bg-background` `text-foreground` `bg-card` `border-border`
`text-muted-foreground` `bg-primary` `bg-accent` `bg-destructive`

**Never use:** `bg-white` `bg-black` `text-white` `text-black` `bg-gray-*`
`text-gray-*`, or hex literals.

This is not style preference — hardcoded colours are invisible in dark mode. There
are ~650 such utilities left in the codebase; migrate them as you touch files.

Light/dark is driven by the `dark` class on `<html>`, set by
`ColorSchemeProvider` with an inline pre-paint script so there is no flash of the
wrong theme. `ThemeProvider` is something different — it selects an **accent hue**
(`data-theme`), and the two are orthogonal.

Controls: `<ColorSchemeToggle />` (three-way: light/dark/system) and
`<ColorSchemeToggleCompact />` for dense surfaces.

## SEO — required on every route

`src/lib/site-config.ts` is the single source of truth for the canonical origin.
Never hardcode a URL: the site moves from `demo.gaddr.com` to `gaddr.com`, and that
must be a config change.

Every new page exports metadata:

```tsx
export const metadata: Metadata = {
  title: 'Discover',                    // template appends " · Gaddr"
  description: '…',                     // under 155 chars, describes the page
  alternates: { canonical: '/discover' },
};
```

- **A client component cannot export `metadata`.** If the page must be
  `"use client"`, add a **server** `layout.tsx` beside it and export
  `generateMetadata` there. That is exactly how `/u/[username]` became indexable —
  its page is a client component, so the public profile shipped with only the
  generic root metadata until the server layout was added.
- Add public routes to `src/app/sitemap.ts`; add private ones to the disallow list
  in `src/app/robots.ts`.
- Public profiles emit `ProfilePage` + `Person` JSON-LD with `sameAs` linking the
  user's other platforms — the entity-consolidation signal a universal-profile
  product should be sending. See `src/lib/public-profile.ts`.

### Metadata is not the page. Check the body too.

Measured on production 2026-07-26: `/` returns 58 characters of visible body
text, `/discover` 58, `/u/<handle>` 17. The metadata work landed; the bodies did
not. **A crawler that does not run JavaScript sees a title and nothing else.**

Measure it like this, and only like this:

```bash
curl -s <url> \
  | perl -0777 -pe 's/<script\b.*?<\/script>//gis; s/<style\b.*?<\/style>//gis; s/<[^>]*>/ /g' \
  | tr -s ' \n' ' ' | wc -c
```

`sed 's/<[^>]*>/ /g'` keeps every script's *contents*, and the RSC flight payload
dwarfs the page: on a Gaddr Jobs page serving 68 real characters it reported
27,393. Measured that way, a broken page looks fine.

Then, before theorising about why a page is empty:

```bash
curl -s <url> | grep -c BAILOUT_TO_CLIENT_SIDE_RENDERING
```

- **Non-zero** → something threw during server rendering; the reason is in the
  `data-msg` attribute beside it, in English.
- **Zero** → nothing threw. The page rendered and had nothing to say, so its data
  arrives on the client. That is this repo's situation today.

The fix for the zero case is not a rewrite. **Next.js server-renders client
components on the first load**, so a `"use client"` page still gets its body into
the HTML — as long as the data is there during that first render. Read it in a
server component and pass it down as TanStack `initialData`. Derive the seed's
type from the fetcher rather than restating it, remember that `null` seeds and
`undefined` does not, and wrap the read in React `cache` so `generateMetadata`
and the body do not fetch it twice.

### `ssr: false` and `next/dynamic`

- **Never above `{children}`.** `ssr: false` does not skip a component during
  server rendering, it throws `BailoutToCSR`, and React unwinds to the nearest
  `<Suspense>`. One such import in a root provider emptied **every route** in the
  Gaddr Jobs app. Not violated here; keep it that way.
- **On a public page, prefer a static import.** A dialog that opens on click is a
  fair use. A skeleton on the render path is not — `/u/[username]/page.tsx` loads
  `ProfileSkeleton` at `ssr: false`, and that is the component most likely to be
  reached during a server render.
- **Verify against `next build && next start`, never the dev server.** A Jobs
  page rendered correctly in dev *and* in a local production build and still
  failed on Vercel, taking the whole route segment, JSON-LD included.

### Determinism once a body renders

Server and client must produce identical text or React discards the
server-rendered subtree — the exact HTML the crawler received. Relevant here
because the product is localised and RTL-aware.

- Dates: always pass an explicit `timeZone`. The server runs UTC and the reader
  does not, so a timestamp near midnight is a different day on each side.
- Numbers: always pass an explicit locale. A bare `toLocaleString()` writes
  `48,000` on the server and `48 000` in a Swedish reader's browser.
- Anything reading `Date.now()`, such as relative timestamps, can never agree.
  Keep it off server-rendered paths.

Full account, with this repo's measurements and a suggested order of work:
[`docs/RENDERING_AND_INDEXABILITY.md`](../../../docs/RENDERING_AND_INDEXABILITY.md).

## Component conventions

- **Server Components by default.** Add `"use client"` only for state, effects, or
  browser APIs. It is a one-way door: everything below becomes client too.
- **Never call browser APIs at module scope in a client component.** Module-level
  code still runs during server rendering, where `localStorage` is undefined, and it
  evaluates once at import so the value goes stale after a token refresh. This was a
  live bug in two OAuth callbacks.
- **TanStack Query owns server state; Zustand owns client state.** Never cache server
  responses in Zustand.
- Compose with Radix + `cva`. `cn()` lives in `@/utils/cn.util` — note, *not*
  `@/lib/utils`.
- SVGs import as React components via svgr. `src/global.d.ts` declares `*.svg`;
  deleting it breaks `yarn type-check` with 130 errors while `yarn build` still
  passes, which is how those errors stayed invisible.
- **Do not add to the duplication.** Two form libraries (`formik`, `react-hook-form`),
  two validators (`yup`, `zod`), two crop libraries, two UI primitive sets.
  Prefer **react-hook-form + zod + Radix** and migrate opportunistically.

## Accessibility

- Interactive elements are `<button>`/`<a>`, never a `div` with `onClick`.
- Every icon-only control needs `aria-label`; decorative icons get
  `aria-hidden="true"`.
- Visible focus: `focus-visible:ring-2 focus-visible:ring-ring`. Never remove
  outlines without a replacement.
- Text contrast ≥ 4.5:1 in **both** schemes — check dark specifically, it is where
  contrast usually fails.
- Touch targets ≥ 44px.
- Use logical properties (`ms-*`, `ps-*`, `start-*`) so Arabic RTL works — see the
  `gaddr-i18n` skill.

## Avoid the AI-generated look and voice

The brief is explicit about this. What reads as machine-made:

**Visual**
- Purple/blue gradient on everything, especially gradient text on headings.
- Glassmorphism plus heavy blur plus a glow, all at once.
- Three feature cards with identical structure, each with a generic icon.
- Emoji as section icons (🚀 ✨ 💡) in a product UI.
- Perfectly even spacing everywhere with no visual hierarchy — real design
  emphasises by *unequal* weighting.
- Centre-aligned everything.

**Copy**
- "Seamlessly", "effortlessly", "unlock", "supercharge", "elevate", "revolutionise",
  "game-changing", "cutting-edge".
- "Not just X — it's Y." Rule-of-three lists everywhere.
- Em-dash-heavy rhythm and relentless parallel structure.
- Vague superlatives instead of concrete facts.

**Instead:** say what the thing does. "Search 12 platforms at once" beats "Unlock
seamless cross-platform discovery." Specific numbers, real screenshots, plain verbs.
Vary sentence length. Let one element dominate a section.

## Search results: three sources, one shape

`normalizeGlobalResults` flattens three things into `SearchResult[]`:

| Source | Meaning |
|---|---|
| `profiles` | Gaddr users. Carry `publicProfile` (a `PublicProfileModel`). |
| `contents` | Content a Gaddr user uploaded natively. |
| `aggregated` | Content collected from another platform and persisted to `contentStreams`. |

**`type: "profile"` means specifically a Gaddr profile.** `SearchResults` renders it via
`ProfileCard`, which reads `result.publicProfile` for the name, follower counts and follow
button. Never map an aggregated result to it — an external YouTube channel has no such
payload, so the card renders blank and offers a follow action that cannot work. External
accounts render as content with a platform badge and an outbound link. That was a real bug,
caught by Playwright while the unit tests were green.

Two more rules for aggregated results: do not fabricate engagement counts (`contentStreams`
does not store them, and zeros misrepresent a popular video), and treat the field as
optional — an older backend omits it, and `?? []` keeps one empty section from breaking the
whole page.

## Verify

```bash
./scripts/ci.sh          # typecheck, lint, unit tests, secret scan, build, Playwright
./scripts/ci.sh --no-e2e # skip the browser tests while iterating
corepack yarn e2e        # Playwright only
```

Playwright runs against a **production build** (`yarn build && yarn start --port 3210`),
**serially with one worker**. Both were forced by observed failures: dev-mode
compile-on-demand under two browser projects blew navigation timeouts, and desktop
failed while mobile passed purely on scheduling. Register `waitForResponse` **before**
`page.goto` — the search request fires after hydration and a debounce, so registering
afterwards races. Full detail in skill `gaddr-frontend-testing`.

`yarn type-check` must stay at 0 errors so CI can gate on it. Check every change in
both colour schemes and at mobile width.


## Error and empty surfaces

Build them from `components/ui/error-state.tsx` rather than by hand. One component so the 404,
the route error boundary and any in-page failure read the same, and so three rules are enforced
in one place:

- **Never show a raw error.** The old `error.tsx` rendered `error.message` into the page —
  "Cannot read properties of undefined (reading 'aggregated')". Show `error.digest` as a
  reference code instead.
- **Always offer a way onward.** A dead end is the worst part of most error screens.
- **Tokens, never hardcoded colours.** `text-gray-600` on an assumed white background is
  grey-on-near-black once dark mode is active. Use `var(--foreground)`,
  `var(--muted-foreground)`, `var(--border)`, `var(--card)`, `var(--primary)`.

There is a Playwright test asserting the 404 heading's **computed colour differs from its
computed background** in dark mode. That is the only reliable way to catch invisible text —
a unit test cannot see it, and neither can a screenshot review in light mode.

`global-error.tsx` is the exception to all of the above: it replaces the root layout, so it has
no providers, no guaranteed stylesheet and no router. Inline styles, a `prefers-color-scheme`
query and a plain `<a>` are correct there, and the `next/link` lint rule is deliberately
disabled with the reason recorded in the file.

## Copy that does not read like a machine wrote it

The error copy is the reference. Takes responsibility ("This one's on us, not you"), says what
to do next, and never uses jargon. Written in `src/i18n/messages/*.json` under `errors`, not
inline — the namespace existed in every locale for weeks with nothing reading it, which is how
English-only strings end up hardcoded in components.
