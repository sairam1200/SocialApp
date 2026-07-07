import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import { DiscoverFeedResponse } from "@/types/discover.type";

interface UseDiscoverContentOptions {
  platform?: string;
  limit?: number;
  userId?: string;
  enabled?: boolean;
}

export const useDiscoverContent = (options?: UseDiscoverContentOptions) => {
  const platform = options?.platform;
  const limit = options?.limit ?? 20;
  const userId = options?.userId;
  const enabled = options?.enabled ?? true;

  return useInfiniteQuery<DiscoverFeedResponse, Error>({
    queryKey: queryKeys.discoverFeed(platform, userId),
    queryFn: async ({ pageParam }) => {
      return apiClient.Discover.getFeed(
        pageParam as string | undefined,
        limit,
        platform,
        userId,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
