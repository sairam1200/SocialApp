---
name: gaddr-i18n
description: Internationalisation and localisation for the Gaddr frontend — adding a locale, translating strings, RTL support for Arabic, locale-aware formatting, and the migration to locale-prefixed URLs. Use when adding or editing user-facing copy, adding a language, or asked about translations, RTL, or hreflang.
when_to_use: Trigger phrases include "add a language", "new locale", "translate", "translation key", "hardcoded string", "the raw key is showing", "next-intl", "useTranslations", "plural", "ICU", "RTL", "Arabic", "mirror the layout", "hreflang", "format a date", "format currency", "timezone", "hydration mismatch on a date", and any edit under src/i18n/ or to a message catalog.
---

# Gaddr i18n

**The rules shared with Gaddr Jobs are in
[`docs/i18n/LANGUAGES.md`](../../../docs/i18n/LANGUAGES.md), and that file is
identical in all three Gaddr repositories.** Read it first. This skill is the
part specific to this front end.

Built on **next-intl 4**. Locale registry: `src/i18n/locales.ts`. Runtime config:
`src/i18n/request.ts`. Catalogs: `src/i18n/messages/<locale>.json`.

## How a locale is chosen

1. `gaddr-locale` cookie — an explicit user choice always wins.
2. `Accept-Language`, matched against locales that actually have a catalog.
3. `DEFAULT_LOCALE` = **`sv`**. Gaddr is Swedish and launches in Sweden; English is
   the fallback for *messages*, not the default locale.

Messages are deep-merged over the English catalog, so a partially translated locale
renders translated keys where they exist and English elsewhere. Without that merge a
missing key renders as the raw dotted path — visibly broken.

## Adding user-facing copy

**Never hardcode a user-facing string.** Add the key to `en.json` and `sv.json`, then:

```tsx
import { useTranslations } from 'next-intl';          // client
const t = useTranslations('search');
<button>{t('submit')}</button>

import { getTranslations } from 'next-intl/server';    // server
const t = await getTranslations('search');
```

- **Key by meaning, not by English wording.** `search.noResults`, not
  `search.nothingFoundText`. When the copy changes, the key should not.
- **Use ICU plurals**, never string concatenation:
  `"{count, plural, =0 {No results} =1 {1 result} other {# results}}"`.
  Swedish and English agree on plural rules; Russian, Polish and Arabic do not
  (Arabic has six categories). Concatenating a number and a noun cannot be
  translated correctly.
- **Never split a sentence across keys.** Word order differs by language. Pass values
  as ICU arguments: `t('resultsFor', { query })`.
- **Never put a locale in a `key`**; interpolate instead.

## Adding a locale

1. Set `hasCatalog: true` in `src/i18n/locales.ts` (the entry already exists for
   every target language).
2. Create `src/i18n/messages/<code>.json` by copying `en.json`.
3. Translate. Leave a key **absent** rather than empty — the merge treats `''` as
   untranslated and falls back, but absence is clearer.
4. Confirm it renders: the picker in `/settings/language` only lists locales with
   `hasCatalog: true`, so a locale that would silently show English is never offered.

Translation itself needs a native speaker. Do not machine-translate product copy
into a shipped catalog — mistranslated UI reads worse than English.

## RTL — Arabic

`dir` comes from the registry and is applied to `<html>` in the root layout, so
`dir="rtl"` already works. The blocker is component CSS.

**~650 directional utilities in this codebase will break in RTL.** Migrate to
logical properties as you touch components:

| Physical (breaks RTL) | Logical (correct) |
|---|---|
| `ml-4` / `mr-4` | `ms-4` / `me-4` |
| `pl-2` / `pr-2` | `ps-2` / `pe-2` |
| `left-0` / `right-0` | `start-0` / `end-0` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `rounded-l` / `rounded-r` | `rounded-s` / `rounded-e` |
| `border-l` / `border-r` | `border-s` / `border-e` |

Also: directional icons (back arrows, chevrons) must mirror — `rtl:rotate-180`.
Never mirror logos, photographs, or numerals.

Verify with `document.documentElement.dir = 'rtl'` in devtools, or set the
`gaddr-locale=ar` cookie.

## Formatting

Never format dates, numbers or currency by hand.

```tsx
const format = useFormatter();
format.dateTime(date, { dateStyle: 'medium' });
format.number(amount, { style: 'currency', currency: 'SEK' });
format.relativeTime(date);
```

`timeZone` is pinned to `Europe/Stockholm` in `request.ts`. Leaving it unset makes
the server use its own zone, which differs between local dev and Cloud Run and
produces hydration mismatches on every formatted date.

## What Gaddr Jobs learned, that applies here

Jobs shipped the same class of bug three times. All three are cheap to prevent
and expensive to find, so they are worth copying rather than repeating.

**A coverage check cannot see a string that was never a key.** Comparing
`en.json` to `sv.json` reported 100 percent while the sidebar rendered 85
hardcoded English labels to Swedish readers. Coverage measures the catalogues
against each other, not the source against the catalogues.

The fix is a second gate that reads the source and fails on hardcoded prose,
locked to the directories that are already clean and widened as files are done.
Jobs has this as `src/__tests__/copy-hardcoded.test.ts`. Its regex matches JSX
text of three or more capitalised words, which is worth knowing precisely:
**a `placeholder`, an `aria-label`, a label array and any two word phrase all
pass it.** Being on the locked list means "no prose the regex can find", not
"translated". Treat it as a ratchet against regression.

**Resolve the locale on the server, or the server renders the default for
everyone.** Jobs read the cookie in a `useEffect`, so every server render was
English, the reader saw a flash of the wrong language, and search engines and
scrapers only ever saw English. This one is invisible in normal use because the
page looks right once it settles. `request.ts` here does it correctly; the test
worth copying is one that renders with `renderToStaticMarkup`, which runs no
effects, and asserts the target language is present and the fallback absent.

**Assert the target language is present, not merely that nothing broke.** A
missing key here deep merges to English, so a page in a half-translated locale
looks fine. "It rendered" is not evidence. Assert the Swedish word is on the
page and the English one is not.

**Do not import every catalog into the client bundle.** With 29 declared locales
this would be fatal. Ship the active one only.

## Known limitation: search normalisation drops non-Latin scripts

`backend/src/core/utils/fuse.util.ts` sanitises queries with an ASCII-only `\w`,
so CJK and Arabic queries reduce to an empty string and cannot be normalised or
cached by term. Asserted in `fuse.util.spec.ts`. **This blocks meaningful search in
the Asian and Arabic markets** and must be fixed before launching there — use
Unicode property escapes (`\p{L}\p{N}`) with the `u` flag.

## Outstanding: locale-prefixed URLs

Locale currently comes from a cookie, so **every locale shares one URL**. That is
materially weaker for SEO: search engines cannot index per-language variants, and
`hreflang` has nothing to point at.

Deferred deliberately — adding a `[locale]` segment means moving all 30 App Router
routes at once. Migration shape:

1. `src/app/[locale]/` wrapping the existing tree; move route groups under it.
2. `next-intl/middleware` for negotiation and redirects, merged with the existing
   `proxy.ts` auth logic (one middleware, ordered: locale, then auth).
3. `generateStaticParams` returning `AVAILABLE_LOCALES`.
4. `alternates.languages` in metadata for `hreflang`, plus `x-default`.
5. Per-locale entries in `sitemap.ts`.

Do this before marketing any locale beyond sv/en.
