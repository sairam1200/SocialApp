import { Get, Query } from "restfit";
import {
  FacebookPageAnalytics,
  FacebookPostAnalytics,
  FacebookVideoAnalytics,
  FacebookAnalyticsTrendsResponse,
  FacebookTopPostsResponse,
  FacebookTopVideosResponse,
} from "@/types/analytics/facebook";

export class FacebookService {
  @Get<FacebookPageAnalytics>("/integrations/facebook/analytics/page")
  async getPageAnalytics(): Promise<FacebookPageAnalytics> {
    return {} as FacebookPageAnalytics;
  }

  @Get<FacebookTopPostsResponse>("/integrations/facebook/analytics/top-posts")
  async getTopPosts(@Query("limit") limit?: string): Promise<FacebookTopPostsResponse> {
    return [] as FacebookTopPostsResponse;
  }

  @Get<FacebookTopVideosResponse>("/integrations/facebook/analytics/top-videos")
  async getTopVideos(@Query("limit") limit?: string): Promise<FacebookTopVideosResponse> {
    return [] as FacebookTopVideosResponse;
  }

  @Get<FacebookAnalyticsTrendsResponse>("/integrations/facebook/analytics/trends")
  async getTrends(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ): Promise<FacebookAnalyticsTrendsResponse> {
    return [] as FacebookAnalyticsTrendsResponse;
  }
}
