import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  isSupportedLocale,
  resolveLocaleFromAcceptLanguage,
} from './locales';

export const LOCALE_COOKIE = 'gaddr-locale';

/**
 * next-intl request configuration.
 *
 * Locale resolution order:
 *   1. The `gaddr-locale` cookie — an explicit choice always wins.
 *   2. The Accept-Language header — matched against locales that actually have a
 *      catalog, so we never claim a language we cannot render.
 *   3. DEFAULT_LOCALE ('sv') — Gaddr launches in Sweden.
 *
 * Messages are deep-merged over the English catalog so a partially translated
 * locale renders translated keys where they exist and English elsewhere. Without
 * this, a missing key surfaces as the raw dotted key path in the UI — far worse
 * than an untranslated but readable string.
 *
 * NOTE ON URL ROUTING — deliberate, documented tradeoff.
 * This setup resolves locale from a cookie rather than a `/[locale]/...` path
 * segment, so every locale shares one URL. That is materially weaker for SEO:
 * search engines cannot index per-language variants and hreflang has nothing to
 * point at. It was chosen because introducing a `[locale]` segment means moving
 * all 30 routes in the App Router tree at once, in a repository that had no tests
 * until this pass. The migration plan is in docs/i18n/README.md and should happen
 * before any locale beyond sv/en is marketed.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: string;

  if (isSupportedLocale(cookieLocale)) {
    locale = cookieLocale as string;
  } else {
    const headerList = await headers();
    locale = resolveLocaleFromAcceptLanguage(
      headerList.get('accept-language'),
    );
  }

  const fallbackMessages = (
    await import(`./messages/${FALLBACK_LOCALE}.json`)
  ).default;

  // A catalog may legitimately not exist yet (hasCatalog: false in locales.ts).
  // Fall back rather than crashing the render.
  let localeMessages: Record<string, unknown> = {};
  if (locale !== FALLBACK_LOCALE) {
    try {
      localeMessages = (await import(`./messages/${locale}.json`)).default;
    } catch {
      localeMessages = {};
    }
  }

  return {
    locale,
    messages: deepMerge(fallbackMessages, localeMessages),
    // Explicit so server and client always agree. Left unset, next-intl warns and
    // falls back to the server's zone, which differs between local dev and
    // Cloud Run and produces hydration mismatches on any formatted date.
    timeZone: 'Europe/Stockholm',
    now: new Date(),
  };
});

/**
 * Deep-merge translated messages over the fallback catalog.
 *
 * Only plain objects are merged; every other value (string, array) is replaced
 * wholesale. Arrays are intentionally not concatenated — a translated list should
 * replace the English one, not append to it.
 */
function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];

    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = deepMerge(existing, value);
    } else if (value !== undefined && value !== null && value !== '') {
      // An empty string in a catalog means "not translated", not "render nothing".
      result[key] = value;
    }
  }

  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export { DEFAULT_LOCALE };
