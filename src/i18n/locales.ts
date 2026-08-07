/**
 * Locale registry — the single source of truth for which languages Gaddr ships.
 *
 * Ordered by rollout priority, not alphabetically: Swedish and English are the
 * launch locales, followed by the Nordics, the rest of Europe, then the
 * expansion markets (Dubai, Asia, US) and Belgium.
 *
 * `dir` matters structurally, not cosmetically. Arabic is right-to-left, which
 * flips layout, iconography, scroll direction and logical CSS properties. Any
 * component using `ml-*`/`mr-*`/`left-*`/`right-*` instead of the logical
 * equivalents (`ms-*`/`me-*`/`start-*`/`end-*`) will break in RTL — see
 * docs/i18n/README.md for the audit.
 */

export type LocaleDirection = 'ltr' | 'rtl';

export type LocaleDefinition = {
  /** BCP 47 tag, used in URLs, <html lang> and hreflang. */
  code: string;
  /** English name, for internal tooling and admin surfaces. */
  englishName: string;
  /** Endonym — what speakers call the language. Always shown in the picker. */
  nativeName: string;
  dir: LocaleDirection;
  /**
   * Whether a reviewed message catalog exists. Locales without one fall back to
   * English rather than rendering raw message keys.
   */
  hasCatalog: boolean;
  /** Default region pairing, used for number/date/currency formatting. */
  defaultRegion: string;
};

export const LOCALES: readonly LocaleDefinition[] = [
  // --- Launch ---------------------------------------------------------------
  { code: 'sv', englishName: 'Swedish', nativeName: 'Svenska', dir: 'ltr', hasCatalog: true, defaultRegion: 'SE' },
  { code: 'en', englishName: 'English', nativeName: 'English', dir: 'ltr', hasCatalog: true, defaultRegion: 'GB' },

  // --- Nordics --------------------------------------------------------------
  { code: 'nb', englishName: 'Norwegian Bokmål', nativeName: 'Norsk bokmål', dir: 'ltr', hasCatalog: false, defaultRegion: 'NO' },
  { code: 'da', englishName: 'Danish', nativeName: 'Dansk', dir: 'ltr', hasCatalog: false, defaultRegion: 'DK' },
  { code: 'fi', englishName: 'Finnish', nativeName: 'Suomi', dir: 'ltr', hasCatalog: false, defaultRegion: 'FI' },
  { code: 'is', englishName: 'Icelandic', nativeName: 'Íslenska', dir: 'ltr', hasCatalog: false, defaultRegion: 'IS' },

  // --- Europe ---------------------------------------------------------------
  // Belgium is a stated partner market: nl and fr are both official there.
  { code: 'nl', englishName: 'Dutch', nativeName: 'Nederlands', dir: 'ltr', hasCatalog: false, defaultRegion: 'NL' },
  { code: 'fr', englishName: 'French', nativeName: 'Français', dir: 'ltr', hasCatalog: false, defaultRegion: 'FR' },
  { code: 'de', englishName: 'German', nativeName: 'Deutsch', dir: 'ltr', hasCatalog: false, defaultRegion: 'DE' },
  { code: 'es', englishName: 'Spanish', nativeName: 'Español', dir: 'ltr', hasCatalog: false, defaultRegion: 'ES' },
  { code: 'pt', englishName: 'Portuguese', nativeName: 'Português', dir: 'ltr', hasCatalog: false, defaultRegion: 'PT' },
  { code: 'it', englishName: 'Italian', nativeName: 'Italiano', dir: 'ltr', hasCatalog: false, defaultRegion: 'IT' },
  { code: 'pl', englishName: 'Polish', nativeName: 'Polski', dir: 'ltr', hasCatalog: false, defaultRegion: 'PL' },
  { code: 'cs', englishName: 'Czech', nativeName: 'Čeština', dir: 'ltr', hasCatalog: false, defaultRegion: 'CZ' },
  { code: 'el', englishName: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr', hasCatalog: false, defaultRegion: 'GR' },
  { code: 'ro', englishName: 'Romanian', nativeName: 'Română', dir: 'ltr', hasCatalog: false, defaultRegion: 'RO' },
  { code: 'hu', englishName: 'Hungarian', nativeName: 'Magyar', dir: 'ltr', hasCatalog: false, defaultRegion: 'HU' },
  { code: 'uk', englishName: 'Ukrainian', nativeName: 'Українська', dir: 'ltr', hasCatalog: false, defaultRegion: 'UA' },
  { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', hasCatalog: false, defaultRegion: 'TR' },
  { code: 'ru', englishName: 'Russian', nativeName: 'Русский', dir: 'ltr', hasCatalog: false, defaultRegion: 'RU' },

  // --- Middle East / North Africa ------------------------------------------
  // Arabic is the first RTL locale; Algeria pairs Arabic with French above.
  { code: 'ar', englishName: 'Arabic', nativeName: 'العربية', dir: 'rtl', hasCatalog: false, defaultRegion: 'AE' },

  // --- Asia -----------------------------------------------------------------
  { code: 'zh-Hans', englishName: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr', hasCatalog: false, defaultRegion: 'CN' },
  { code: 'zh-Hant', englishName: 'Chinese (Traditional)', nativeName: '繁體中文', dir: 'ltr', hasCatalog: false, defaultRegion: 'TW' },
  { code: 'ja', englishName: 'Japanese', nativeName: '日本語', dir: 'ltr', hasCatalog: false, defaultRegion: 'JP' },
  { code: 'ko', englishName: 'Korean', nativeName: '한국어', dir: 'ltr', hasCatalog: false, defaultRegion: 'KR' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', hasCatalog: false, defaultRegion: 'IN' },
  { code: 'id', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', hasCatalog: false, defaultRegion: 'ID' },
  { code: 'th', englishName: 'Thai', nativeName: 'ไทย', dir: 'ltr', hasCatalog: false, defaultRegion: 'TH' },
  { code: 'vi', englishName: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr', hasCatalog: false, defaultRegion: 'VN' },
] as const;

/**
 * Swedish, not English. Gaddr is a Swedish company launching in Sweden first, and
 * the default locale is what users see before any preference is detected.
 */
export const DEFAULT_LOCALE = 'sv';

/** Fallback for messages missing from a catalog. */
export const FALLBACK_LOCALE = 'en';

export const LOCALE_CODES = LOCALES.map((locale) => locale.code);

/** Locales with a reviewed catalog — the only ones offered in the picker today. */
export const AVAILABLE_LOCALES = LOCALES.filter((locale) => locale.hasCatalog);

const LOCALE_BY_CODE = new Map(LOCALES.map((locale) => [locale.code, locale]));

export function isSupportedLocale(value: string | null | undefined): boolean {
  return !!value && LOCALE_BY_CODE.has(value);
}

export function getLocale(code: string): LocaleDefinition | undefined {
  return LOCALE_BY_CODE.get(code);
}

export function getDirection(code: string): LocaleDirection {
  return LOCALE_BY_CODE.get(code)?.dir ?? 'ltr';
}

/**
 * Resolve a usable locale from an Accept-Language header.
 *
 * Matches most specific first (`zh-Hant` before `zh`), honours quality values,
 * and only returns a locale that actually has a catalog — offering a locale whose
 * catalog is missing would render English anyway while claiming otherwise.
 */
export function resolveLocaleFromAcceptLanguage(
  header: string | null | undefined,
): string {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const quality = qParam ? Number.parseFloat(qParam.split('=')[1]) : 1;
      return { tag: tag.trim(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  const catalogued = new Set(AVAILABLE_LOCALES.map((locale) => locale.code));

  for (const { tag } of ranked) {
    if (catalogued.has(tag)) return tag;

    // 'sv-SE' -> 'sv'; 'zh-Hant-TW' -> 'zh-Hant' -> 'zh'
    const segments = tag.split('-');
    for (let end = segments.length - 1; end >= 1; end -= 1) {
      const candidate = segments.slice(0, end).join('-');
      if (catalogued.has(candidate)) return candidate;
    }
  }

  return DEFAULT_LOCALE;
}
