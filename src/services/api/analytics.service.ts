import { Get, Query } from "restfit";

export interface UserAnalytics {
  followers: number;
  following: number;
  totalPosts: number;
  followerGrowth: { date: string; value: number }[];
}

export interface ContentPost {
  id: string;
  title: string;
  platform: string;
  publishedAt: string | null;
  engagement: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
}

export interface ContentAnalytics {
  posts: ContentPost[];
  totalEngagement: number;
  platformBreakdown: Record<string, number>;
}

export interface PlatformAnalytics {
  platforms: PlatformAnalyticsItem[];
}

export type PlatformAnalyticsStatus =
  | "available"
  | "no_data"
  | "permission_required"
  | "permission_denied"
  | "unsupported";

export type AnalyticsPermissionState =
  | "granted"
  | "denied"
  | "required"
  | "unverified"
  | "not_required"
  | "unavailable";

export interface PlatformAnalyticsItem {
  platform: string;
  status: PlatformAnalyticsStatus;
  dataStatus: "available" | "no_data";
  permission: {
    state: AnalyticsPermissionState;
    reason:
      | "missing_credential"
      | "credential_expired"
      | "missing_scopes"
      | "scope_unverifiable"
      | "paid_api"
      | "unsupported_api"
      | null;
    apiAccess: "free" | "approval_required" | "paid" | "unsupported";
    nativeAnalyticsSupported: boolean;
    requiredScopes: string[];
    grantedScopes: string[];
    missingScopes: string[];
  };
  metrics: {
    followers: number;
    following: number;
    postCount: number;
    impressions: number;
    reach: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    engagement: number;
    engagementRate: number;
  };
  trend: { date: string; value: number }[];
  insights: {
    code:
      "audience_size" | "content_published" | "engagement_rate" | "top_content";
    value: number;
    contentTitle?: string;
  }[];
}

export class AnalyticsService {
  @Get("/analytics/user")
  async getUserAnalytics(
    @Query("range") range?: string,
  ): Promise<UserAnalytics> {
    return {} as UserAnalytics;
  }

  @Get("/analytics/content")
  async getContentAnalytics(
    @Query("range") range?: string,
  ): Promise<ContentAnalytics> {
    return {} as ContentAnalytics;
  }

  @Get("/analytics/platform")
  async getPlatformAnalytics(
    @Query("range") range?: string,
  ): Promise<PlatformAnalytics> {
    return {} as PlatformAnalytics;
  }
}
