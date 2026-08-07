/**
 * Single source of truth for canonical URLs, brand strings and SEO defaults.
 *
 * Everything that needs to know "where does this site live" reads from here:
 * metadata, robots.ts, sitemap.ts, JSON-LD and OG image URLs. Hardcoding the
 * origin in each of those is how canonical tags and sitemaps drift apart, which
 * search engines penalise.
 *
 * The site currently runs at demo.gaddr.com and moves to gaddr.com as the root
 * domain later. Set NEXT_PUBLIC_SITE_URL per environment so that migration is a
 * config change, not a code change — and so preview deployments never emit
 * canonical URLs pointing at production.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  // Vercel exposes the deployment host but not the scheme.
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return 'https://demo.gaddr.com';
}

export const siteConfig = {
  /** Canonical origin, never with a trailing slash. */
  url: resolveSiteUrl(),

  name: 'Gaddr',

  /**
   * Used in the `title.template` so every page reads "<Page> · Gaddr" without
   * each route repeating the brand.
   */
  titleSeparator: '·',

  defaultTitle: 'Gaddr — one profile for every identity you have online',

  /**
   * Kept under ~155 characters so it is not truncated in result snippets, and
   * written to describe the product rather than to stuff keywords.
   */
  defaultDescription:
    'Search people and content across every major platform, and bring your own profiles, links and posts together in one place.',

  /** Search-and-discovery product framing. Order is deliberate: most-specific first. */
  keywords: [
    'universal profile',
    'social media search',
    'cross-platform search',
    'link in bio',
    'creator profile',
    'digital identity',
    'content aggregator',
  ],

  locale: 'en',

  twitterHandle: '@gaddr',

  ogImage: {
    path: '/opengraph-image',
    width: 1200,
    height: 630,
  },
} as const;

/** Absolute URL for a path. Accepts values with or without a leading slash. */
export function absoluteUrl(path = ''): string {
  if (!path) return siteConfig.url;
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Canonical URL for a public profile. */
export function profileUrl(username: string): string {
  return absoluteUrl(`/${encodeURIComponent(username)}`);
}
