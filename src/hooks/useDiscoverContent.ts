import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import { DiscoverFeedResponse } from "@/types/discover.type";
import { getCachedDiscoverFeed, setCachedDiscoverFeed } from "@/lib/discover-cache";
import { useEffect } from "react";
import { useAuthUserStore } from "@/store/auth-user.store";

interface UseDiscoverContentOptions {
  limit?: number;
  userId?: string;
  enabled?: boolean;
}

export const useDiscoverContent = (options?: UseDiscoverContentOptions) => {
  const limit = options?.limit ?? 20;
  const userId = options?.userId;
  const enabled = options?.enabled ?? true;
  const viewerUserId = useAuthUserStore((state) => state.authUser?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const cached = await getCachedDiscoverFeed(undefined, userId, viewerUserId);
      if (cancelled || !cached) return;
      const qk = queryKeys.discoverFeed(userId, viewerUserId);
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
  }, [userId, viewerUserId, enabled, queryClient]);

  return useInfiniteQuery<DiscoverFeedResponse, Error>({
    queryKey: queryKeys.discoverFeed(userId, viewerUserId),
    queryFn: async ({ pageParam }) => {
      const data = await apiClient.Discover.getFeed(
        pageParam as string | undefined,
        limit,
        userId,
      );
      if (!pageParam) {
        setCachedDiscoverFeed(undefined, userId, data, undefined, viewerUserId).catch(() => {});
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
