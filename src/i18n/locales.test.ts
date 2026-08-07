import { describe, expect, it } from 'vitest'
import {
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALES,
  LOCALE_CODES,
  getDirection,
  getLocale,
  isSupportedLocale,
  resolveLocaleFromAcceptLanguage,
} from './locales'

/**
 * The locale registry decides what language every visitor sees before they express a
 * preference, and `dir` decides whether the layout is even usable for Arabic
 * speakers. Both are cheap to get wrong and expensive to notice.
 */

describe('registry integrity', () => {
  it('defaults to Swedish', () => {
    // Deliberate: Gaddr is a Swedish company launching in Sweden. English is the
    // message fallback, not the default locale. If someone changes this to 'en',
    // that should be a conscious decision, not a drive-by edit.
    expect(DEFAULT_LOCALE).toBe('sv')
  })

  it('falls back to a locale that has a catalog', () => {
    expect(FALLBACK_LOCALE).toBe('en')
    expect(AVAILABLE_LOCALES.map((l) => l.code)).toContain(FALLBACK_LOCALE)
  })

  it('has both the default and fallback locale catalogued', () => {
    // A default locale without a catalog would render raw message keys to every
    // first-time visitor.
    const catalogued = AVAILABLE_LOCALES.map((l) => l.code)
    expect(catalogued).toContain(DEFAULT_LOCALE)
    expect(catalogued).toContain(FALLBACK_LOCALE)
  })

  it('has no duplicate locale codes', () => {
    expect(new Set(LOCALE_CODES).size).toBe(LOCALE_CODES.length)
  })

  it('gives every locale a non-empty native name distinct from nothing', () => {
    // The picker shows endonyms; an empty one renders a blank option.
    for (const locale of LOCALES) {
      expect(locale.nativeName.trim().length).toBeGreaterThan(0)
      expect(locale.englishName.trim().length).toBeGreaterThan(0)
      expect(locale.defaultRegion).toMatch(/^[A-Z]{2}$/)
    }
  })

  it('uses only ltr or rtl for direction', () => {
    for (const locale of LOCALES) {
      expect(['ltr', 'rtl']).toContain(locale.dir)
    }
  })

  it('covers the stated target markets', () => {
    // The brief names these explicitly. A missing entry means that market cannot be
    // served at all, so it is worth failing loudly rather than discovering it later.
    const codes = new Set(LOCALE_CODES)

    // Nordics
    for (const code of ['sv', 'nb', 'da', 'fi', 'is']) {
      expect(codes, `missing Nordic locale ${code}`).toContain(code)
    }
    // Belgium is a stated partner market — both official languages.
    for (const code of ['nl', 'fr']) {
      expect(codes, `missing Belgian locale ${code}`).toContain(code)
    }
    // Russian, Arabic (Dubai / Algeria), and Asia.
    for (const code of ['ru', 'ar', 'ja', 'ko', 'zh-Hans', 'hi']) {
      expect(codes, `missing locale ${code}`).toContain(code)
    }
  })
})

describe('getDirection', () => {
  it('reports Arabic as right-to-left', () => {
    expect(getDirection('ar')).toBe('rtl')
  })

  it('reports European locales as left-to-right', () => {
    for (const code of ['sv', 'en', 'de', 'fi', 'ru', 'el']) {
      expect(getDirection(code)).toBe('ltr')
    }
  })

  it('defaults to ltr for an unknown locale rather than throwing', () => {
    // This value reaches <html dir>. Throwing would take the whole page down.
    expect(getDirection('klingon')).toBe('ltr')
    expect(getDirection('')).toBe('ltr')
  })
})

describe('isSupportedLocale', () => {
  it('accepts registered locales', () => {
    expect(isSupportedLocale('sv')).toBe(true)
    expect(isSupportedLocale('zh-Hant')).toBe(true)
  })

  it('rejects unregistered, empty and nullish values', () => {
    // This guards a cookie value that is later used to build an import() path, so it
    // must reject anything not in the registry.
    expect(isSupportedLocale('xx')).toBe(false)
    expect(isSupportedLocale('')).toBe(false)
    expect(isSupportedLocale(null)).toBe(false)
    expect(isSupportedLocale(undefined)).toBe(false)
    expect(isSupportedLocale('../../../etc/passwd')).toBe(false)
    expect(isSupportedLocale('sv; rm -rf /')).toBe(false)
  })

  it('is case-sensitive, matching BCP 47 script subtags exactly', () => {
    expect(isSupportedLocale('zh-Hans')).toBe(true)
    expect(isSupportedLocale('zh-hans')).toBe(false)
  })
})

describe('getLocale', () => {
  it('returns the full definition', () => {
    expect(getLocale('ar')).toMatchObject({
      code: 'ar',
      dir: 'rtl',
      englishName: 'Arabic',
    })
  })

  it('returns undefined for an unknown code', () => {
    expect(getLocale('xx')).toBeUndefined()
  })
})

describe('resolveLocaleFromAcceptLanguage', () => {
  it('falls back to the default when the header is absent', () => {
    expect(resolveLocaleFromAcceptLanguage(null)).toBe(DEFAULT_LOCALE)
    expect(resolveLocaleFromAcceptLanguage(undefined)).toBe(DEFAULT_LOCALE)
    expect(resolveLocaleFromAcceptLanguage('')).toBe(DEFAULT_LOCALE)
  })

  it('matches an exact locale tag', () => {
    expect(resolveLocaleFromAcceptLanguage('en')).toBe('en')
    expect(resolveLocaleFromAcceptLanguage('sv')).toBe('sv')
  })

  it('strips the region to match the base language', () => {
    // Browsers send 'sv-SE' and 'en-GB', not bare language codes.
    expect(resolveLocaleFromAcceptLanguage('en-GB')).toBe('en')
    expect(resolveLocaleFromAcceptLanguage('sv-SE')).toBe('sv')
    expect(resolveLocaleFromAcceptLanguage('en-US,en;q=0.9')).toBe('en')
  })

  it('honours quality values rather than header order', () => {
    // A browser can list a lower-priority language first. Picking by position would
    // serve the wrong language.
    expect(resolveLocaleFromAcceptLanguage('de;q=0.2,en;q=0.9')).toBe('en')
    expect(resolveLocaleFromAcceptLanguage('en;q=0.3,sv;q=0.8')).toBe('sv')
  })

  it('skips languages that have no catalog yet', () => {
    // 'de' is registered but has no catalog. Returning it would render English while
    // claiming to be German, so the resolver must skip to the next candidate.
    expect(resolveLocaleFromAcceptLanguage('de,en;q=0.5')).toBe('en')
    expect(resolveLocaleFromAcceptLanguage('ja,ko,zh-Hans')).toBe(DEFAULT_LOCALE)
  })

  it('never returns a locale without a catalog', () => {
    const catalogued = new Set(AVAILABLE_LOCALES.map((l) => l.code))

    for (const header of [
      'de-DE,de;q=0.9',
      'ar-AE',
      'ja-JP,ja;q=0.9,en;q=0.1',
      'zh-Hant-TW',
      'xx-YY',
      '*',
    ]) {
      expect(
        catalogued,
        `header "${header}" resolved to an uncatalogued locale`,
      ).toContain(resolveLocaleFromAcceptLanguage(header))
    }
  })

  it('tolerates malformed headers without throwing', () => {
    for (const header of [
      ';;;',
      'en;q=',
      'en;q=notanumber',
      ',,,',
      '   ',
      'q=1',
    ]) {
      expect(() => resolveLocaleFromAcceptLanguage(header)).not.toThrow()
      expect(typeof resolveLocaleFromAcceptLanguage(header)).toBe('string')
    }
  })

  it('treats an unparseable quality value as lowest priority', () => {
    // 'en;q=notanumber' parses to NaN, which is coerced to 0 — so a valid candidate
    // with any real quality should win.
    expect(resolveLocaleFromAcceptLanguage('en;q=notanumber,sv;q=0.1')).toBe('sv')
  })
})
