import { SearchResult, UnifiedSearchContentItem } from "@/types/search.types";

export function normalizeSearchResultProject(
  item: UnifiedSearchContentItem,
): SearchResult {
  const pm = item.platformMetadata ?? {};
  return {
    id: item.id,
    type: "project",
    platform: item.platform,
    title: item.title,
    description: item.description,
    externalId: item.externalId,
    publishedAt: item.publishedAt,
    author: undefined,
    media: undefined,
    engagement: {},
    platformMetadata: pm,
  };
}
