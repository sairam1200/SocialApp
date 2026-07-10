/* eslint-disable @typescript-eslint/no-unused-vars */
import { Post, Body, Query, Get, Path } from "restfit";
import {
  SearchRequest,
  SearchResponse,
  SearchResult,
  TrendingResponse,
  NormalizedSearchResults,
  TwitterContent,
  InstagramContent,
  YouTubeContent,
  GlobalSearchResponse,
  GlobalSearchSuggestion,
} from "@/types/search.types";
import { normalizePublicProfile } from "@/lib/normalizers/profile.normalizer";
import { normalizeGlobalSearchContent } from "@/lib/normalizers/content.normalizer";

export class SearchService {
  /**
   * Search across multiple social media platforms
   * POST /search
   */
  @Post<SearchResponse>("/search")
  async search(@Body() body: SearchRequest): Promise<SearchResponse> {
    return {
      query: "",
      platforms: [],
      results: {},
      totalResults: 0,
      page: 0,
      limit: 0,
    };
  }

  /**
   * Get trending content
   * GET /search/trending
   */
  @Get<TrendingResponse>("/search/trending")
  async getTrending(
    @Query("platforms") platforms?: string,
    @Query("limit") limit?: number
  ): Promise<TrendingResponse> {
    return {
      items: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get search suggestions
   * GET /search/suggestions
   */
  @Get<{ suggestions: GlobalSearchSuggestion[] }>("/search/suggestions")
  async getSuggestions(
    @Query("keyword") keyword: string
  ): Promise<{ suggestions: GlobalSearchSuggestion[] }> {
    return {
      suggestions: [],
    };
  }

  @Get<GlobalSearchResponse>("/search/results")
  async getGlobalResults(
    @Query("keyword") keyword: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 12
  ): Promise<GlobalSearchResponse> {
    return {
      profiles: [],
      contents: [],
      pagination: {
        page,
        limit,
        profiles: { total: 0 },
        contents: { total: 0 },
      },
    };
  }

  normalizeGlobalResults(response: GlobalSearchResponse): NormalizedSearchResults {
    const profiles: SearchResult[] = response.profiles.map((profile) => {
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
      return {
        id: profile.id,
        type: "profile",
        platform: "gaddr",
        title: name || profile.userName,
        description: profile.bio ?? undefined,
        author: {
          id: profile.id,
          name: name || profile.userName,
          handle: profile.userName ? `@${profile.userName}` : undefined,
          profileImage: profile.profileImage ?? undefined,
        },
        engagement: {
          likes: profile.followersCount ?? 0,
          views: 0,
        },
        publicProfile: normalizePublicProfile(profile),
      };
    });
    const contents: SearchResult[] = response.contents.map(normalizeGlobalSearchContent);
    return {
      results: [...profiles, ...contents],
      totalResults: response.pagination.profiles.total + response.pagination.contents.total,
    };
  }

  /**
   * Normalize platform-specific results into a flat array
   * Converts the multi-platform response structure into a single array for UI rendering
   */
  normalizeResults(response: SearchResponse): NormalizedSearchResults {
    const results: SearchResult[] = [];

    response.profiles?.forEach((profile) => {
      const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();

      results.push({
        id: profile.id,
        type: "profile",
        platform: "gaddr",
        title: displayName || profile.userName,
        description: profile.bio ?? profile.niche ?? "Creator profile",
        author: {
          id: profile.id,
          name: displayName || profile.userName,
          handle: `@${profile.userName}`,
          profileImage: profile.profileImage ?? undefined,
        },
        engagement: {
          views: profile.totalPosts,
          likes: profile.followersCount,
        },
        publicProfile: profile,
      });
    });

    // Process Twitter results
    if (response.results.twitter?.result?.content) {
      response.results.twitter.result.content.forEach((item: TwitterContent) => {
        results.push({
          id: item.id,
          type: "post",
          platform: "twitter",
          title: (item.title || item.text) as string | undefined,
          description: (item.description || item.text) as string | undefined,
          externalId: item.externalId as string | undefined,
          author: item.author as Record<string, unknown> | undefined,
          engagement: item.engagement as Record<string, unknown> | undefined,
          publishedAt: item.publishedAt as string | undefined,
          url: item.url as string | undefined,
        });
      });
    }

    // Process Instagram results
    if (response.results.instagram?.result?.content) {
      response.results.instagram.result.content.forEach((item: InstagramContent) => {
        results.push({
          id: item.id,
          type: (item.type || "content") as "post" | "profile" | "video" | "reel" | "content" | "feed",
          platform: "instagram",
          title: item.title as string | undefined,
          description: item.title as string | undefined,
          externalId: item.externalId as string | undefined,
          author: item.author as Record<string, unknown> | undefined,
          engagement: item.engagement as Record<string, unknown> | undefined,
          publishedAt: item.publishedAt as string | undefined,
          url: item.url as string | undefined,
        });
      });
    }

    // Process YouTube results
    if (response.results.youtube?.results) {
      response.results.youtube.results.forEach((item: YouTubeContent) => {
        results.push({
          id: item.id,
          type: "video",
          platform: "youtube",
          title: item.title as string,
          description: item.description as string | undefined,
          externalId: item.externalId || item.id,
          media: {
            type: "video",
            thumbnailUrl: item.thumbnailUrl as string | undefined,
          },
          engagement: item.engagement as Record<string, unknown> | undefined,
          publishedAt: item.publishedAt as string | undefined,
          channelId: item.channelId as string | undefined,
          url: `https://youtube.com/watch?v=${item.externalId || item.id}`,
        });
      });
    }

    // Process Facebook results (flatten all data arrays)
    if (response.results.facebook?.results) {
      const fbResults = response.results.facebook.results;
      const allFbItems = [
        ...(fbResults.feeds?.data || []),
        ...(fbResults.posts?.data || []),
        ...(fbResults.pages?.data || []),
        ...(fbResults.videos?.data || []),
      ] as Record<string, unknown>[];

      allFbItems.forEach((item: Record<string, unknown>) => {
        results.push({
          id: item.id as string,
          type: "post",
          platform: "facebook",
          title: (item.name as string) || (item.title as string),
          description: (item.description as string) || (item.story as string),
          author: item.from as Record<string, unknown> | undefined,
          engagement: item.engagement as Record<string, unknown> | undefined,
          publishedAt: item.created_time as string | undefined,
          url: item.link as string | undefined,
        });
      });
    }

    return {
      results,
      paginationTokens: response.paginationTokens,
      totalResults: response.totalResults,
    };
  }
}
