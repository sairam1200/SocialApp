import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-config';

/**
 * XML sitemap for the publicly indexable surface.
 *
 * Only marketing and legal pages are listed here. Public profiles (/<username>)
 * are deliberately NOT enumerated yet — see the note at the bottom, which is the
 * next piece of work rather than an oversight.
 *
 * `changeFrequency` and `priority` are hints only; search engines largely ignore
 * them. `lastModified` is the field that matters, so it is set from the build
 * timestamp for static pages.
 */

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: SitemapEntry['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/discover', changeFrequency: 'hourly', priority: 0.9 },
  { path: '/platform-status', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Build-time constant: stable across all requests to one deployment, which is
  // the correct semantics for pages whose content ships with the build.
  const lastModified = new Date();

  return STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}

/**
 * NEXT STEP — public profiles in the sitemap.
 *
 * Profiles are the highest-value indexable surface for a Linktree-class product,
 * and they are currently absent from the sitemap entirely.
 *
 * They are not simply appended here because doing it naively breaks at scale:
 *
 *  - A single sitemap is capped at 50,000 URLs / 50 MB uncompressed. Beyond that
 *    it needs a sitemap index with paginated children
 *    (generateSitemaps() in Next.js).
 *  - This function runs per request unless the route is cached. Enumerating every
 *    profile means a full-table read on each crawl, so it needs its own cache with
 *    a revalidate window.
 *  - Only profiles that are public, complete and non-empty should be listed.
 *    Indexing thin or private profiles invites a thin-content penalty and leaks
 *    profiles whose owner set profilePrivacy to private.
 *  - `lastModified` should come from the profile's own lastModifiedOn column so
 *    crawlers can prioritise genuinely changed pages.
 *
 * Required backend support: a paginated, indexable-profiles-only endpoint
 * returning { userName, lastModifiedOn } — cheap enough to page through, and
 * filtered by privacy and completeness server-side. Tracked in
 * docs/seo/README.md.
 */
