import React from "react";
import YoutubeRedIcon from "@/components/svg/Youtube.svg";
import FacebookBlueIcon from "@/components/svg/facebook-blue.svg";
import InstagramColorIcon from "@/components/svg/instagram-colored.svg";
import PinterestIcon from "@/components/svg/pinterest.svg";
import XIcon from "@/components/svg/x-icon.svg";
import LinkedInIcon from "@/components/svg/linkedin-blue.svg";
import TiktokIcon from "@/components/svg/tiktok-black-circle.svg";
import { SearchResult } from "@/types/search.types";
import { DiscoverContentModel } from "@/types/discover.type";
import { resolveSearchContent } from "@/lib/resolvers/search-content.resolver";

// Re-export types from the canonical location for backward compatibility
import type { StatType, StatItem, CardContentProps } from "@/types/content-card.types";
export type { StatType, StatItem, CardContentProps };

/**
 * Human-readable source names.
 *
 * Only the ones whose casing is not a plain capitalisation need an entry — everything
 * else is title-cased at render time, so a new platform never arrives unlabelled.
 */
const platformDisplayNames: Record<string, string> = {
    github: "GitHub",
    hackernews: "Hacker News",
    linkedin: "LinkedIn",
    openverse: "Openverse",
    tiktok: "TikTok",
    x: "X",
    youtube: "YouTube",
};

export function platformDisplayName(platform: string): string {
    const key = platform.trim().toLowerCase();
    if (!key) return "Unknown source";
    return (
        platformDisplayNames[key] ??
        key.charAt(0).toUpperCase() + key.slice(1)
    );
}

/**
 * Source attribution for a result card.
 *
 * This used to `return null` for any platform without a bundled brand SVG, which meant
 * four of the five working search sources — GitHub, Apple, Openverse and Hacker News —
 * rendered with no indication of where the result came from. For an aggregation product
 * that is not a cosmetic gap: the provenance *is* the value, and an unattributed card
 * reads as Gaddr's own content.
 *
 * So the fallback is a monogram badge rather than nothing. It renders in the same
 * avatar-corner slot as the brand marks and at the same size, carries the full source
 * name in `title`, and means the next platform someone adds is attributed the moment it
 * returns data with no UI change.
 *
 * The monogram alone is not the whole answer — two letters are recognisable, not
 * self-explanatory — so the card also prints the full source name in its footer via
 * `platformDisplayName`. Overlay for scanning, footer for certainty.
 */
export function renderPlatformIcon(
    platform: string,
    className?: string
): React.ReactNode {
    const cls = className ?? "w-5 h-5 text-blue-600";
    switch (platform) {
        case "facebook":
            return <FacebookBlueIcon className={cls} />;
        case "youtube":
            return <YoutubeRedIcon className="w-6 h-6 text-red-600" />;
        case "instagram":
            return <InstagramColorIcon className="w-6 h-6 text-red-600" />;
        case "pinterest":
            return <PinterestIcon className={cls} />;
        case "twitter":
        case "x":
            return <XIcon className={cls} />;
        case "linkedin":
            return <LinkedInIcon className={cls} />;
        case "tiktok":
            return <TiktokIcon className={cls} />;
        default: {
            const name = platformDisplayName(platform);
            return (
                <span
                    // Tokens, not hardcoded hex, so this tracks light/dark like the rest.
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-semibold uppercase leading-none text-muted-foreground"
                    title={name}
                    // The monogram is decorative shorthand; the accessible name is the
                    // real source. Without this a screen reader announces "HN".
                    role="img"
                    aria-label={name}
                >
                    {platformMonogram(name)}
                </span>
            );
        }
    }
}

/**
 * Two letters for the fallback badge: initials for a multi-word name, the first two
 * characters otherwise. "Hacker News" → HN, "Openverse" → OP, "Apple" → AP.
 */
export function platformMonogram(displayName: string): string {
    const words = displayName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
}

/**
 * Attribution line for openly-licensed media.
 *
 * Returns null unless the source actually stated terms. That asymmetry is deliberate:
 * showing nothing for unlicensed content is correct, while showing a licence we cannot
 * substantiate would be worse than showing none at all.
 *
 * Openverse is the reason this exists. Its results are worth more than scraped imagery
 * precisely because reuse rights are provable — and a CC-BY image rendered without its
 * attribution breaches the licence that made it usable.
 */
export function renderLicenseAttribution(
    result: Pick<SearchResult, "license" | "creator">
): React.ReactNode {
    const license = result.license;
    if (!license?.code) return null;

    const label = license.version
        ? `${license.code.toUpperCase()} ${license.version}`
        : license.code.toUpperCase();

    const credit = result.creator?.trim();

    return (
        <span className="inline-flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            {credit ? <span>{credit}</span> : null}
            {license.url ? (
                <a
                    href={license.url}
                    // Outbound to creativecommons.org: noopener for the window handle,
                    // noreferrer so we do not leak the searching user's page as referrer.
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline decoration-dotted underline-offset-2 hover:text-foreground"
                >
                    {label}
                </a>
            ) : (
                <span>{label}</span>
            )}
        </span>
    );
}

export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export function buildContentText(
    title: string | undefined | null,
    description: string | undefined | null,
    titleLimit = 34
): React.ReactNode {
    const t = title?.trim() ?? "";
    const d = description?.trim() ?? "";
    if (!t && !d) return null;
    return (
        <>
            {t && (
                <span className="font-semibold block line-clamp-1">
                    {t.substring(0, titleLimit)}
                </span>
            )}
            {d && (
                <span className="text-sm text-muted-foreground block line-clamp-2">
                    {d}
                </span>
            )}
        </>
    );
}

export function buildEngagementStats(
  engagement: { views?: number | null; likes?: number | null; comments?: number | null; shares?: number | null } | null | undefined,
): StatItem[] {
  const stats: StatItem[] = [];
  if (engagement?.views != null && engagement.views > 0) {
    stats.push({ type: "views", value: engagement.views });
  }
  if (engagement?.likes != null && engagement.likes > 0) {
    stats.push({ type: "likes", value: engagement.likes, clickable: true });
  }
  if (engagement?.comments != null && engagement.comments > 0) {
    stats.push({ type: "comments", value: engagement.comments });
  }
  if (engagement?.shares != null && engagement.shares > 0) {
    stats.push({ type: "shares", value: engagement.shares });
  }
  return stats;
}

export function normalizeSearchResult(result: SearchResult): CardContentProps {
  const resolved = resolveSearchContent(result);
  const title = resolved.title?.trim() ?? "";
  const description = resolved.description?.trim() ?? "";
  const date = resolved.publishedAt
    ? new Date(resolved.publishedAt).toLocaleDateString()
    : undefined;

  return {
    imageSrc: resolved.thumbnailUrl,
    profilePicSrc: resolved.profileImage ?? null,
    userName: resolved.displayName,
    userHandle: resolved.handle,
    verified: resolved.verified,
    platform: resolved.platform,
    textContent: buildContentText(title, description),
    date,
    stats: buildEngagementStats({
      views: resolved.viewCount,
      likes: resolved.likeCount,
      comments: resolved.commentCount,
      shares: resolved.shareCount,
    }),
    sourceUrl: resolved.sourceUrl,
  };
}

export function normalizeDiscoverContent(
  item: DiscoverContentModel,
  titleLimit = 34,
): CardContentProps {
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString()
    : undefined;

  return {
    imageSrc: item.imageUrl ?? undefined,
    profilePicSrc: item.userProfileImage ?? null,
    userName: item.userName,
    userHandle: item.userHandle,
    verified: item.verified,
    platform: item.platform,
    textContent: buildContentText(item.title, item.description, titleLimit),
    date,
    stats: buildEngagementStats({
      views: item.views,
      likes: item.likes,
      comments: item.comments,
    }),
    sourceUrl: item.sourceUrl ?? undefined,
  };
}

export function normalizeBookmarkContent(
  item: {
    id?: string;
    title?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
    platform?: string | null;
    contentUrl?: string | null;
    createdOn?: string | null;
    addedBy?: { displayName?: string; userName?: string } | null;
    metadata?: Record<string, any> | null;
  },
  titleLimit = 34,
): CardContentProps {
  const resolved = resolveSearchContent({
    title: item.title,
    description: item.description,
    platform: item.platform,
    thumbnailUrl: item.thumbnailUrl,
    sourceUrl: item.contentUrl,
    creatorName: item.addedBy?.displayName,
    creatorUsername: item.addedBy?.userName,
    creatorAvatar: item.metadata?.creatorAvatar,
    publishedAt: item.createdOn,
    platformMetadata: item.metadata,
  });

  return {
    imageSrc: resolved.thumbnailUrl ?? undefined,
    profilePicSrc: resolved.profileImage ?? null,
    userName: resolved.displayName,
    userHandle: resolved.handle,
    verified: resolved.verified,
    platform: resolved.platform,
    textContent: buildContentText(resolved.title, resolved.description, titleLimit),
    date: resolved.publishedAt
      ? new Date(resolved.publishedAt).toLocaleDateString()
      : undefined,
    stats: buildEngagementStats({
      views: resolved.viewCount,
      likes: resolved.likeCount,
      comments: resolved.commentCount,
      shares: resolved.shareCount,
    }),
    sourceUrl: resolved.sourceUrl ?? undefined,
  };
}

export interface ProfileCardProps {
  userId?: string;
  profilePicSrc: string | null;
  userName: string;
  userHandle: string;
  category: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  linkedAccounts: { id: string; platform: string }[];
  profileHref?: string;
  initialIsFollowing?: boolean;
  isProfileAvailable?: boolean;
}

export function mapProfileToProps(
  profile: {
    id?: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    profileImage?: string | null;
    niche?: string | null;
    totalPosts?: number;
    followersCount?: number;
    followingCount?: number;
    linkedAccounts?: { id: string; platform: string }[];
    isFollowing?: boolean;
  } | null | undefined,
  fallbacks?: {
    id?: string;
    profileImage?: string;
    userName?: string;
  },
): ProfileCardProps {
  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const userName = profile?.userName ?? fallbacks?.userName ?? "";
  const isProfileAvailable = !!userName;

  return {
    userId: profile?.id ?? fallbacks?.id,
    profilePicSrc:
      profile?.profileImage ?? fallbacks?.profileImage ?? null,
    userName: displayName || userName || "Unknown",
    userHandle: isProfileAvailable ? `@${userName}` : "",
    category: profile?.niche ?? "Creator",
    postCount: profile?.totalPosts ?? 0,
    followerCount: profile?.followersCount ?? 0,
    followingCount: profile?.followingCount ?? 0,
    linkedAccounts: profile?.linkedAccounts ?? [],
    profileHref: isProfileAvailable ? `/${userName}` : undefined,
    initialIsFollowing: profile?.isFollowing ?? false,
    isProfileAvailable,
  };
}
