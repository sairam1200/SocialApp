import { GlobalSearchContent, SearchResult } from "@/types/search.types";

export function normalizeGlobalSearchContent(
  content: GlobalSearchContent,
): SearchResult {
  const creatorName = [content.user.firstName, content.user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const mediaArray = Array.isArray(content.media) ? content.media : [];
  const thumbnailFromMedia = mediaArray[0]?.thumbnail || mediaArray[0]?.url;
  const meta = content.metaData;
  const thumbnailFromMeta =
    meta?.thumbnailUrl ||
    meta?.imageUrl ||
    meta?.mediaUrl ||
    meta?.coverImageUrl;
  const thumbnailUrl = thumbnailFromMedia || thumbnailFromMeta || undefined;
  const rawEngagement = content.engagement || meta;

  return {
    id: content.id,
    type: "content",
    platform: content.platform,
    title: content.title,
    description: content.description ?? content.title,
    externalId: content.externalId,
    url: content.sourceUrl,
    publishedAt: content.publishedAt,
    author: {
      id: content.user.id,
      name: creatorName || content.user.userName,
      handle: content.user.userName
        ? `@${content.user.userName}`
        : undefined,
      profileImage: content.user.profileImage ?? undefined,
    },
    ...(thumbnailUrl
      ? { media: { type: "image" as const, thumbnailUrl } }
      : {}),
    engagement: {
      views:
        rawEngagement?.views ??
        (meta?.viewCount || meta?.impressions || 0),
      likes: rawEngagement?.likes ?? (meta?.likeCount || 0),
      comments:
        rawEngagement?.comments ??
        (meta?.commentCount ||
          meta?.commentsCount ||
          meta?.numComments ||
          0),
      shares: rawEngagement?.shares ?? 0,
    },
  };
}
