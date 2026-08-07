import { siteConfig } from '@/lib/site-config';
import { cache } from 'react';

/**
 * Server-side fetch of a public profile, used for SEO metadata and JSON-LD.
 *
 * This exists separately from the client `useGetUser` hook on purpose: metadata
 * must be produced during the server render, before any React hook can run. The
 * backend endpoint `GET /api/v1/user/profile/public` carries no auth guard, so it
 * is safe to call unauthenticated from the server.
 */

export type PublicProfile = {
  id: string;
  userName: string;
  firstName?: string | null;
  lastName?: string | null;
  DisplayName?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  followersCount?: number;
  followingCount?: number;
  connectedPlatformsCount?: number;
  totalPosts?: number;
  niche?: string | null;
  verified?: boolean;
  linkedAccounts?: Array<{
    platform?: string | null;
    externalUrl?: string | null;
    userName?: string | null;
  }>;
};

/**
 * Resolve the API origin for server-side calls.
 *
 * NEXT_PUBLIC_API_BASE_URL is what the browser uses and may be a relative path
 * that relies on the next.config.ts rewrite — which does not exist during a
 * server render. AUTH_API_URL is the server-side backend origin (the same value
 * the rewrite and proxy.ts target), so prefer it here.
 */
function resolveApiBase(): string | null {
  const base =
    process.env.AUTH_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    null;

  if (!base) return null;
  if (!/^https?:\/\//.test(base)) return null; // relative path: unusable server-side

  return base.replace(/\/$/, '');
}

/**
 * Fetch a public profile, or return null.
 *
 * Deliberately returns null rather than throwing on any failure. A metadata
 * function that throws takes the whole page down with it, so an unreachable
 * backend must degrade to generic metadata and still render the client page —
 * which fetches its own data anyway.
 */
export const getPublicProfile = cache(async function getPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  const apiBase = resolveApiBase();
  if (!apiBase || !username) return null;

  const url = `${apiBase}/api/v1/user/profile/public?userName=${encodeURIComponent(username)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Profiles change rarely relative to how often they are crawled and shared.
      // A 5-minute window keeps metadata fresh while collapsing crawler bursts and
      // social-unfurl storms into a single origin request.
      next: { revalidate: 300, tags: [`profile:${username}`] },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as PublicProfile | null;
    if (!data || !data.userName) return null;

    return data;
  } catch {
    return null;
  }
});

/** Human-facing display name, falling back through the available name fields. */
export function profileDisplayName(profile: PublicProfile): string {
  const composed = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    profile.DisplayName?.trim() ||
    (composed.length > 0 ? composed : null) ||
    profile.userName
  );
}

/**
 * Build the meta description for a profile.
 *
 * Prefers the user's own bio, because original copy outperforms a generated
 * sentence. Falls back to a factual summary rather than boilerplate — a
 * description repeated across thousands of profiles reads as thin content.
 * Truncated on a word boundary at 155 characters to avoid mid-word cuts in
 * result snippets.
 */
export function profileDescription(profile: PublicProfile): string {
  const bio = profile.bio?.trim();
  if (bio) return truncateAtWord(bio, 155);

  const name = profileDisplayName(profile);
  const platformCount = profile.connectedPlatformsCount ?? 0;

  const parts: string[] = [];
  if (platformCount > 0) {
    parts.push(
      `${name} on ${platformCount} platform${platformCount === 1 ? '' : 's'}`,
    );
  } else {
    parts.push(`${name} on ${siteConfig.name}`);
  }

  if (profile.niche) parts.push(profile.niche);

  return truncateAtWord(
    `${parts.join(' — ')}. See their profiles, links and posts in one place.`,
    155,
  );
}

function truncateAtWord(value: string, maxLength: number): string {
  const collapsed = value.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) return collapsed;

  const clipped = collapsed.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(' ');

  return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/**
 * schema.org ProfilePage + Person JSON-LD.
 *
 * `sameAs` is the valuable part: it links this profile to the user's verified
 * presences elsewhere, which is exactly the entity-consolidation signal search
 * engines use to connect identities across the web. It is also precisely what a
 * universal-profile product should be emitting.
 */
export function profileJsonLd(profile: PublicProfile) {
  const name = profileDisplayName(profile);

  const sameAs = (profile.linkedAccounts ?? [])
    .map((account) => account.externalUrl?.trim())
    .filter((url): url is string => Boolean(url && /^https?:\/\//.test(url)));

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: undefined as string | undefined,
    mainEntity: {
      '@type': 'Person',
      name,
      alternateName: profile.userName,
      ...(profile.bio ? { description: profile.bio } : {}),
      ...(profile.profileImage ? { image: profile.profileImage } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
      ...(profile.followersCount
        ? {
            interactionStatistic: {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/FollowAction',
              userInteractionCount: profile.followersCount,
            },
          }
        : {}),
    },
  };
}
