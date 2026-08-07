import { Get, Query } from "restfit";
import { DiscoverFeedResponse, ForYouFeedResponse } from "@/types/discover.type";

export class DiscoverService {
  @Get("/discover/feed")
  async getFeed(
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("userId") userId?: string
  ): Promise<DiscoverFeedResponse> {
    return { contents: [], nextCursor: null, hasMore: false };
  }

  @Get("/discover/for-you")
  async getForYouFeed(
    @Query("limit") limit?: number
  ): Promise<ForYouFeedResponse> {
    return { items: [], totalCount: 0 };
  }
}
