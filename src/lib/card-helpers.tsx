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

export type StatType = "views" | "likes" | "comments" | "shares";

export interface StatItem {
  type: StatType;
  value: number;
  clickable?: boolean;
}

export interface CardContentProps {
  imageSrc?: string;
  profilePicSrc: string | null;
  userName: string;
  userHandle?: string;
  platform: string;
  textContent: React.ReactNode;
  date?: string;
  stats: StatItem[];
  sourceUrl?: string;
}

export function renderPlatformIcon(
    platform: string,
    className?: string
): React.ReactNode {
    const cls = className ?? "w-5 h-5 text-blue-600";
    switch (platform) {
        case "facebook":
            return <FacebookBlueIcon className={cls} />;
        case "youtube":
            return <YoutubeRedIcon className={cls} />;
        case "instagram":
            return <InstagramColorIcon className={cls} />;
        case "pinterest":
            return <PinterestIcon className={cls} />;
        case "twitter":
        case "x":
            return <XIcon className={cls} />;
        case "linkedin":
            return <LinkedInIcon className={cls} />;
        case "tiktok":
            return <TiktokIcon className={cls} />;
        default:
            return null;
    }
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
  const title = result.title?.trim() ?? "";
  const description = result.description?.trim() ?? "";
  const date = result.publishedAt
    ? new Date(result.publishedAt).toLocaleDateString()
    : undefined;

  return {
    imageSrc: result.media?.url || result.media?.thumbnailUrl,
    profilePicSrc: result.author?.profileImage ?? null,
    userName: result.author?.name || "Unknown",
    userHandle: result.author?.handle || "@unknown",
    platform: result.platform,
    textContent: buildContentText(title, description),
    date,
    stats: buildEngagementStats(result.engagement),
    sourceUrl: result.url,
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
    profileHref: isProfileAvailable ? `/u/${userName}` : undefined,
    initialIsFollowing: profile?.isFollowing ?? false,
    isProfileAvailable,
  };
}
