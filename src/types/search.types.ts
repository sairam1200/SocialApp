import { PublicProfileModel } from "@/types/account/profile.type";

/**
 * Search API Types
 * Defines request/response structures for the search endpoint
 * Based on actual multi-platform API response structure
 */

/** Searchable entity types on the wire (never compare to raw strings). */
export const SearchEntityType = {
  CONTENT: "content",
  PROFILE: "profile",
  PROJECT: "project",
  JOB: "job",
} as const;

export type SearchEntityType =
  (typeof SearchEntityType)[keyof typeof SearchEntityType];

/** Active search result type tab */
/**
 * The tabs on a search results page.
 *
 * `all` and `for-you` are cross-cutting: they hold every kind of result at
 * once, which the per-type tabs cannot. They are served by unified search
 * rather than by the per-type queries, so they carry no page/pagination state.
 */
export type SearchTypeTab =
	| "all"
	| "for-you"
	| "profiles"
	| "contents"
	| "projects"
	| "jobs";

/** The tabs backed by the per-type search API, with their own pagination. */
export const TYPED_SEARCH_TABS = ["profiles", "contents", "projects"] as const;

export function isTypedSearchTab(
	tab: SearchTypeTab,
): tab is (typeof TYPED_SEARCH_TABS)[number] {
	return (TYPED_SEARCH_TABS as readonly string[]).includes(tab);
}

/** Maps a UI tab to the wire entity type. */
export const searchTypeToEntity: Record<SearchTypeTab, SearchEntityType> = {
  all: SearchEntityType.CONTENT,
  "for-you": SearchEntityType.CONTENT,
  profiles: SearchEntityType.PROFILE,
  contents: SearchEntityType.CONTENT,
  projects: SearchEntityType.PROJECT,
  jobs: SearchEntityType.JOB,
};

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

/**
 * One aggregated cross-platform result from `contentStreams`.
 *
 * This is content the backend collected from another platform (YouTube, Pinterest,
 * TikTok…) and persisted, so it is served from our own database rather than by calling
 * the platform again. Distinct from `GlobalSearchContent`, which is content a Gaddr
 * user uploaded natively.
 *
 * `url` is a canonical link back to the source platform, reconstructed server-side —
 * platforms often return short-lived signed CDN URLs, so a stored one would 404. It can
 * be null when the platform has no derivable URL shape; render such a result without a
 * link rather than linking nowhere.
 */
export interface GlobalSearchAggregated {
  id: string;
  platform: string;
  /** 'Profile' or 'Content'. */
  type: string;
  /** Platform-specific kind: video, channel, playlist, pin, board, track… */
  subType: string | null;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  url: string | null;
  externalId: string;
  /** When this row was last refreshed from the source platform. */
  lastRefreshed: string | null;
  /**
   * Who made this, when the source names them — a channel, a repository owner, a
   * photographer. **Not** a Gaddr user, so never render it as a followable profile.
   */
  creator?: string | null;
  /**
   * Reuse terms, when the source states them. Openverse is why this exists.
   *
   * `null`/absent means the source stated no terms, which is **not** the same as
   * permissive — treat it as all-rights-reserved and show nothing.
   */
  license?: {
    code: string;
    version: string | null;
    url: string | null;
  } | null;
}

/** Reuse terms attached to a result. Mirrors the backend projection. */
export interface ResultLicense {
  code: string;
  version: string | null;
  url: string | null;
}

export interface GlobalSearchResponse {
  profiles: GlobalSearchProfile[];
  contents: GlobalSearchContent[];
  /**
   * Aggregated cross-platform content.
   *
   * Optional because the field was added after the initial contract — an older backend
   * omits it, and treating that as an error would break the whole results page rather
   * than one section.
   */
  aggregated?: GlobalSearchAggregated[];
  pagination: {
    page: number;
    limit: number;
    profiles: { total: number };
    contents: { total: number };
    aggregated?: { total: number };
  };
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

export type SearchFacets = Record<SearchEntityType, number>;

/** Resolved creator identity attached by the backend to an item. */
export interface FlatSearchCreator {
  displayName: string;
  handle: string;
  rawUserName: string | null;
  profileImage: string | null;
  verified: boolean;
  profileUrl: string | null;
  platform: string | null;
  source: string;
  userId?: string | null;
}

/** One item from the flat search response (backend SearchResult). */
export interface FlatSearchItem {
  id: string;
  /** Present when this result is backed by contentStreams and can be tracked. */
  contentStreamId?: string;
  /** Gaddr-side preview views, returned as a bigint-safe string. */
  gaddrViews?: string;
  platform: string;
  externalId: string;
  type: SearchEntityType;
  subType: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  mediaUrl: string;
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar: string;
  creator?: FlatSearchCreator | null;
  publishedAt?: string;
  engagement: {
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    subscriberCount?: number;
    followerCount?: number;
  };
  score: number;
  rank: number;
  platformMetadata: Record<string, any>;
}

/** Flat search response (backend SearchResponse). */
export interface FlatSearchResponse {
  query: string;
  items: FlatSearchItem[];
  pagination: SearchPagination;
  facets: SearchFacets;
}

/** Normalized search result item for UI rendering */
export interface SearchResult {
  id: string;
  contentStreamId?: string;
  /** Gaddr-side preview views, returned as a bigint-safe string. */
  gaddrViews?: string;
  type: SearchEntityType;
  description: string | null;
  platform: string;
  subType?: string;
  title?: string;
  content?: string;
  externalId?: string;
  author?: {
    id?: string;
    name?: string;
    handle?: string;
    profileImage?: string;
    verified?: boolean;
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
  score?: number;
  rank?: number;
  profileImage?: unknown;
  platformMetadata?: Record<string, any>;
  /** Source-stated creator, for attribution. Not a Gaddr user. */
  creator?: string | null;
  /** Source-stated reuse terms. Absent means all-rights-reserved, not permissive. */
  license?: ResultLicense | null;
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

// ===== Unified API Response =====
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
