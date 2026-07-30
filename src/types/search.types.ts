import { PublicProfileModel } from "@/types/account/profile.type";

/**
 * Search API Types
 * Defines request/response structures for the search endpoint
 * Based on actual multi-platform API response structure
 */

/** Active search result type tab */
export type SearchTypeTab = "profiles" | "contents" | "projects";

/** Pagination tokens for different platforms */
export interface PaginationTokens {
  youtube?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  [key: string]: string | null | undefined;
}

/** Filter configuration for search */
export interface SearchFilter {
  contentType?: string[];
  metrics?: string[];
  datePosted?: string;
  monetization?: string[];
  [key: string]: string | string[] | undefined;
}

/** Search API Request */
export interface SearchRequest {
  query: string;
  platforms: string[];
  filter?: SearchFilter;
  page?: number;
  limit?: number;
  paginationTokens?: PaginationTokens;
}

export interface GlobalSearchSuggestion {
  id: string;
  type: "user" | "userContent" | "project";
  label: string;
  userName?: string;
  href?: string;
  creatorName?: string;
}

export interface GlobalSearchProfile extends Partial<PublicProfileModel> {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SearchMediaItem {
  thumbnail?: string;
  url?: string;
  type?: string;
}

export interface GlobalSearchContent {
  id: string;
  title: string;
  description?: string;
  type: string;
  platform: string;
  externalId: string;
  sourceUrl?: string;
  publishedAt?: string;
  media?: SearchMediaItem[];
  metaData?: Record<string, any>;
  engagement?: {
    views?: number | null;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
  };
  user: GlobalSearchProfile;
}

export interface GlobalSearchResponse {
  profiles: GlobalSearchProfile[];
  contents: GlobalSearchContent[];
  pagination: {
    page: number;
    limit: number;
    profiles: { total: number };
    contents: { total: number };
  };
}

/** Normalized search result item (after flattening platform-specific results) */
export interface SearchResult {
  id: string;
  type: "post" | "profile" | "video" | "reel" | "content" | "feed" | "project";
  platform: string;
  title?: string;
  description?: string;
  content?: string;
  externalId?: string;
  author?: {
    id?: string;
    name?: string;
    handle?: string;
    profileImage?: string;
  };
  media?: {
    type: "image" | "video" | "text";
    url?: string;
    thumbnailUrl?: string;
  };
  engagement?: {
    views?: number | null;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
  };
  url?: string;
  publishedAt?: string;
  channelId?: string;
  [key: string]: unknown;
}

// ===== Twitter Response Types =====
export interface TwitterContent {
  id: string;
  text?: string;
  title?: string;
  externalId?: string;
  author?: Record<string, unknown>;
  engagement?: Record<string, unknown>;
  publishedAt?: string;
  url?: string;
  [key: string]: unknown;
}

export interface TwitterResult {
  query: string;
  result: {
    user: TwitterContent[];
    content: TwitterContent[];
  };
  resultCount: number;
}

// ===== Instagram Response Types =====
export interface InstagramContent {
  id: string;
  title?: string;
  type?: string;
  externalId?: string;
  author?: Record<string, unknown>;
  engagement?: Record<string, unknown>;
  publishedAt?: string;
  url?: string;
  [key: string]: unknown;
}

export interface InstagramResult {
  query: string;
  result: {
    user: InstagramContent[];
    content: InstagramContent[];
  };
}

// ===== Facebook Response Types =====
export interface FacebookData {
  data: Record<string, unknown>[];
}

export interface FacebookResult {
  query: string;
  results: {
    feeds: FacebookData;
    posts: FacebookData;
    likes: FacebookData;
    pages: FacebookData;
    groups: FacebookData;
    events: FacebookData;
    people: FacebookData;
    videos: FacebookData;
    accounts: Record<string, unknown>[];
  };
}

// ===== YouTube Response Types =====
export interface YouTubePageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YouTubeContent {
  id: string;
  title: string;
  type?: string;
  externalId?: string;
  description?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  channelId?: string;
  [key: string]: unknown;
}

export interface YouTubeResult {
  query: string;
  results: YouTubeContent[];
  pageInfo: YouTubePageInfo;
  nextPageToken?: string;
}

// ===== Unified API Response (legacy platform-specific format) =====
export interface SearchResponse {
  query: string;
  platforms: string[];
  profiles?: PublicProfileModel[];
  results: {
    twitter?: TwitterResult;
    instagram?: InstagramResult;
    facebook?: FacebookResult;
    youtube?: YouTubeResult;
    [platform: string]: TwitterResult | InstagramResult | FacebookResult | YouTubeResult | undefined;
  };
  paginationTokens?: PaginationTokens;
  totalResults: number;
  page: number;
  limit: number;
}

// ===== Unified Search Backend Response (POST /search — contentStreams corpus) =====
export interface UnifiedSearchContentItem {
  id: string;
  platform: string;
  externalId: string;
  type: string;
  subType: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  mediaUrl: string;
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar: string;
  publishedAt: string;
  engagement: {
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
  };
  score: number;
  rank: number;
  platformMetadata: Record<string, any>;
}

export interface UnifiedSearchResponse {
  query: string;
  platforms: string[];
  results: Record<string, UnifiedSearchContentItem[]>;
  paginationTokens: Record<string, string | null>;
  totalResults: number;
  page: number;
  limit: number;
}

/** Normalized flattened results for UI rendering */
export interface NormalizedSearchResults {
  results: SearchResult[];
  paginationTokens?: PaginationTokens;
  totalResults: number;
}

/** Project search result from GET /api/v1/projects/search */
export interface ProjectSearchResult {
  id: number;
  title: string;
  description: string | null;
  budget: string | null;
  currency: string;
  paymentType: string;
  timeline: string | null;
  skills: string[];
  status: string;
  projectType: string;
  bountyAmount: string | null;
  trialDuration: number | null;
  hireOnCompletion: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Project search API response */
export interface ProjectSearchResponse {
  result: ProjectSearchResult[];
  total: number;
}

/** Trending content item */
export interface TrendingItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  trendScore: number;
  platforms: string[];
  growth?: number;
  icon?: string;
  href?: string;
}

/** Trending content response */
export interface TrendingResponse {
  items: TrendingItem[];
  timestamp: string;
}
