import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { ForYouFeedResponse } from "@/types/discover.type";

interface UseForYouFeedOptions {
  limit?: number;
  enabled?: boolean;
}

export const useForYouFeed = (options?: UseForYouFeedOptions) => {
  const limit = options?.limit ?? 30;
  const enabled = options?.enabled ?? true;

  return useQuery<ForYouFeedResponse, Error>({
    queryKey: ["discover", "for-you", limit],
    queryFn: async () => {
      const data = await apiClient.Discover.getForYouFeed(limit);
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
