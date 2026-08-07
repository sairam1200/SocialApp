import {
  FlatSearchItem,
  SearchEntityType,
  SearchResult,
} from "@/types/search.types";

export function normalizeSearchResultProject(
  item: FlatSearchItem,
): SearchResult {
  return {
    id: item.id,
    type: SearchEntityType.PROJECT,
    subType: item.subType,
    platform: item.platform,
    title: item.title,
    description: item.description,
    externalId: item.externalId,
    publishedAt: item.publishedAt,
    url: item.platformMetadata?.sourceUrl ?? item.platformMetadata?.url,
    author: undefined,
    media: undefined,
    engagement: {},
    score: item.score,
    rank: item.rank,
    platformMetadata: item.platformMetadata,
  };
}
