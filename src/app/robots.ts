import type { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

/**
 * robots.txt, generated so the sitemap URL and the canonical host can never drift
 * from src/lib/site-config.ts.
 *
 * Two deliberate choices:
 *
 *  1. Non-production deployments are fully disallowed. Preview and staging builds
 *     serving the same content as production is a classic duplicate-content
 *     problem, and it also leaks unreleased pages into the index.
 *
 *  2. Authenticated and transactional routes are excluded even though they
 *     require a login. Crawlers requesting them generates pointless load and
 *     redirect chains, and OAuth callback URLs carry query parameters that should
 *     never be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production';

  const isCanonicalHost = siteConfig.url.includes('gaddr.com');

  if (!isProduction || !isCanonicalHost) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          // A Gaddr Card is a private link handed to named people. Indexing one
          // would publish exactly what the owner chose not to publish, and a
          // crawler following it would burn an open against the card's limit.
          // The route is noindex in its own metadata too — this is the layer
          // that stops the request being made at all.
          '/c/',
          // Authenticated areas — nothing indexable, and crawling them only
          // produces redirects to /login.
          '/settings',
          '/settings/',
          '/bookmarks',
          '/collections',
          '/analytics',
          '/publishing',
          '/admin',
          '/billing',
          '/cards',
          '/community/messages',
          '/onboarding',
          // Auth and account-lifecycle flows.
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/confirm-email',
          '/goodbye',
          '/data-deletion',
          // OAuth round-trips: these carry codes and state in the query string.
          '/oauth-callback/',
          '/integrations/',
          // Internal diagnostics.
          '/refresh-test',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
