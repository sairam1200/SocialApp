import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import { DiscoverFeedResponse } from "@/types/discover.type";
import { getCachedDiscoverFeed, setCachedDiscoverFeed } from "@/lib/discover-cache";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const cached = await getCachedDiscoverFeed(platform, userId);
      if (cancelled || !cached) return;
      const qk = queryKeys.discoverFeed(platform, userId);
      const existing = queryClient.getQueryData<InfiniteData<DiscoverFeedResponse>>(qk);
      if (existing) return;
      queryClient.setQueryData<InfiniteData<DiscoverFeedResponse>>(
        qk,
        {
          pages: [cached.data],
          pageParams: [undefined as string | undefined],
        },
        { updatedAt: cached.cachedAt },
      );
    })();
    return () => { cancelled = true; };
  }, [platform, userId, enabled, queryClient]);

  return useInfiniteQuery<DiscoverFeedResponse, Error>({
    queryKey: queryKeys.discoverFeed(platform, userId),
    queryFn: async ({ pageParam }) => {
      const data = await apiClient.Discover.getFeed(
        pageParam as string | undefined,
        limit,
        platform,
        userId,
      );
      if (!pageParam) {
        setCachedDiscoverFeed(platform, userId, data).catch(() => {});
      }
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};
