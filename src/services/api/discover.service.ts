import { Get, Query } from "restfit";
import { DiscoverFeedResponse } from "@/types/discover.type";

export class DiscoverService {
  @Get("/discover/feed")
  async getFeed(
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("userId") userId?: string
  ): Promise<DiscoverFeedResponse> {
    return { contents: [], nextCursor: null, hasMore: false };
  }
}
