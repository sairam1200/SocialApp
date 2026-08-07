import {
  FlatSearchItem,
  SearchEntityType,
  SearchResult,
} from "@/types/search.types";
import { normalizeSearchResultProject } from "./project.normalizer";
import { pinterestResultUrl } from "@/lib/result-url";

function isVideoSubType(subType: string): boolean {
  return /video|short|reel/i.test(subType || "");
}

function mapAuthor(
  item: FlatSearchItem,
  meta: Record<string, any>,
): SearchResult["author"] {
  const creator = item.creator;
  return {
    id: creator?.userId ?? undefined,
    name:
      creator?.displayName ||
      item.creatorName ||
      meta.channelTitle ||
      meta.channelName ||
      "",
    handle:
      creator?.handle ||
      item.creatorUsername ||
      meta.channelUsername ||
      meta.channelHandle ||
      meta.username ||
      meta.customUrl ||
      undefined,
    profileImage:
      creator?.profileImage ||
      item.creatorAvatar ||
      meta.channelAvatar ||
      meta.channelProfileImage ||
      meta.avatar ||
      meta.profileImage ||
      undefined,
    verified:
      creator?.verified ?? meta.verified ?? meta.isVerified ?? undefined,
  };
}

function mapEngagement(item: FlatSearchItem, meta: Record<string, any>) {
  return {
    views:
      item.engagement?.viewCount ??
      meta.engagement?.viewCount ??
      meta.viewCount ??
      meta.views ??
      null,
    likes:
      item.engagement?.likeCount ??
      meta.engagement?.likeCount ??
      meta.likeCount ??
      meta.likes ??
      null,
    comments:
      item.engagement?.commentCount ??
      meta.engagement?.commentCount ??
      meta.commentCount ??
      meta.comments ??
      null,
    shares:
      item.engagement?.shareCount ??
      meta.engagement?.shareCount ??
      meta.shareCount ??
      meta.shares ??
      null,
  };
}

/** Maps one flat wire item to the UI SearchResult shape, grouped by entity type. */
export function normalizeFlatSearchItem(item: FlatSearchItem): SearchResult {
  const meta = item.platformMetadata ?? {};
  const resolvedUrl = item.platform.toLowerCase() === "pinterest"
    ? pinterestResultUrl(item.externalId, item.subType, meta)
    : meta.sourceUrl ?? meta.youtubeUrl ?? meta.url ?? meta.channelUrl;

  const base = {
    id: item.id,
    contentStreamId: item.contentStreamId,
    gaddrViews: item.gaddrViews,
    platform: item.platform,
    subType: item.subType,
    title: item.title,
    description: item.description || meta.description || "",
    externalId: item.externalId,
    url: resolvedUrl,
    publishedAt: item.publishedAt || meta.publishedAt || undefined,
    score: item.score,
    rank: item.rank,
  };

  if (item.type === SearchEntityType.PROFILE) {
    return {
      ...base,
      type: SearchEntityType.PROFILE,
      author: mapAuthor(item, meta),
      engagement: mapEngagement(item, meta),
      publicProfile: item.platformMetadata,
    };
  }

  if (item.type === SearchEntityType.PROJECT) {
    return normalizeSearchResultProject(item);
  }

  return {
    ...base,
    type: item.type,
    author: mapAuthor(item, meta),
    media: {
      type: isVideoSubType(item.subType) ? "video" : "image",
      thumbnailUrl:
        item.thumbnailUrl ||
        meta.thumbnailUrl ||
        meta.thumbnails?.high?.url ||
        meta.thumbnails?.medium?.url ||
        meta.thumbnails?.default?.url ||
        undefined,
      url:
        item.mediaUrl ||
        meta.mediaUrl ||
        meta.media_url ||
        meta.youtubeUrl ||
        meta.shareUrl ||
        meta.permalink ||
        undefined,
    },
    engagement: mapEngagement(item, meta),
    platformMetadata: item.platformMetadata,
  };
}

export function normalizeFlatSearchResults(
  items: FlatSearchItem[],
): SearchResult[] {
  return items.map(normalizeFlatSearchItem);
}
