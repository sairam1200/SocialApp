/* eslint-disable @typescript-eslint/no-unused-vars */
import { Post, Query, Get, Body, Path } from "restfit";
import {
  FlatSearchResponse,
  GlobalSearchSuggestion,
  SearchEntityType,
  TrendingResponse,
} from "@/types/search.types";
import type { SearchResultItem } from "@/types/unified-search.type";

export interface SearchRequestBody {
  searchTerm: string;
  platforms?: string[];
  type?: SearchEntityType;
  page?: number;
  cursor?: string;
  limit?: number;
  forceRefresh?: boolean;
}

export interface SearchResultEngagementStats {
  views: string;
  externalClicks: string;
}

export interface ProfileContentStreamsResponse {
  items: SearchResultItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export type TrendingSearchReasonCode =
  | "global-trending"
  | "rising-fast"
  | "matches-your-interests"
  | "trending-near-you"
  | "trending-in-your-country";

export interface TrendingSearchApiItem {
  rank: number;
  query: string;
  normalizedQuery: string;
  score: number;
  searchCount: number;
  uniqueSearchers: number;
  velocityScore?: number;
  lastSearchedAt: string;
  reasonCodes: TrendingSearchReasonCode[];
}

export interface TrendingSearchApiResponse {
  generatedAt: string | null;
  stale: boolean;
  windowHours: number;
  refreshIntervalSeconds: number;
  personalization: {
    mode: "global" | "personalized";
    interestTopicCount: number;
    location?: {
      countryCode: string;
      regionCode?: string | null;
    };
  };
  items: TrendingSearchApiItem[];
}

const EMPTY_RESPONSE: FlatSearchResponse = {
  query: "",
  items: [],
  pagination: { page: 1, limit: 25, total: 0, hasMore: false },
  facets: {
    [SearchEntityType.CONTENT]: 0,
    [SearchEntityType.PROFILE]: 0,
    [SearchEntityType.PROJECT]: 0,
    [SearchEntityType.JOB]: 0,
  },
};

export class SearchService {
  /**
   * Flat search across all entity types (profiles, content, projects, jobs).
   * POST /search
   */
  @Post<FlatSearchResponse>("/search")
  async search(@Body() body: SearchRequestBody): Promise<FlatSearchResponse> {
    return EMPTY_RESPONSE;
  }

  @Get<SearchResultEngagementStats>("/search/content-streams/{contentStreamId}/stats")
  async getResultStats(
    @Path("contentStreamId") contentStreamId: string,
  ): Promise<SearchResultEngagementStats> {
    return { views: "0", externalClicks: "0" };
  }

  @Post<SearchResultEngagementStats>("/search/content-streams/{contentStreamId}/engagement")
  async trackResultEngagement(
    @Path("contentStreamId") contentStreamId: string,
    @Body() body: { event: "view" | "external_click" },
  ): Promise<SearchResultEngagementStats> {
    return { views: "0", externalClicks: "0" };
  }

  @Get<ProfileContentStreamsResponse>("/search/profiles/{username}/content-streams")
  async getProfileContentStreams(
    @Path("username") username: string,
    @Query("page") page = 1,
    @Query("limit") limit = 24,
  ): Promise<ProfileContentStreamsResponse> {
    return { items: [], page, limit, total: 0, hasMore: false };
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

  /** Shared, anonymous Trending Search ordering. */
  @Get<TrendingSearchApiResponse>("/search/trending")
  async getTrendingSearch(
    @Query("limit") limit = 10
  ): Promise<TrendingSearchApiResponse> {
    return emptyTrendingSearchResponse("global");
  }

  /** Owner-specific ordering; authentication is carried by the httpOnly cookie. */
  @Get<TrendingSearchApiResponse>("/search/trending/personalized")
  async getPersonalizedTrendingSearch(
    @Query("limit") limit = 10
  ): Promise<TrendingSearchApiResponse> {
    return emptyTrendingSearchResponse("personalized");
  }
}

function emptyTrendingSearchResponse(
  mode: "global" | "personalized"
): TrendingSearchApiResponse {
  return {
    generatedAt: null,
    stale: true,
    windowHours: 48,
    refreshIntervalSeconds: 300,
    personalization: {
      mode,
      interestTopicCount: 0,
    },
    items: [],
  };
}
