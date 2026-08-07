import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient.service";
import type { TrendingSearchApiResponse } from "@/services/api/search.service";
import { useAuthUserStore } from "@/store/auth-user.store";
import { TrendingItem, TrendingResponse } from "@/types/search.types";

export interface UseTrendingState {
  items: TrendingItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Mock trending data generator
 */
const generateMockTrending = (): TrendingItem[] => {
  return [
    {
      id: "trend-1",
      title: "#TechTrends2025",
      description: "Latest developments in technology",
      category: "Technology",
      trendScore: 95,
      platforms: ["twitter", "instagram"],
      growth: 45,
      href: "#",
    },
    {
      id: "trend-2",
      title: "AI Revolution",
      description: "Artificial Intelligence breakthroughs",
      category: "AI/Tech",
      trendScore: 88,
      platforms: ["youtube", "tiktok", "twitter"],
      growth: 38,
      href: "#",
    },
    {
      id: "trend-3",
      title: "#ContentCreation",
      description: "Tips for better content creation",
      category: "Creator",
      trendScore: 82,
      platforms: ["instagram", "tiktok"],
      growth: 52,
      href: "#",
    },
    {
      id: "trend-4",
      title: "Social Media Hacks",
      description: "Growth strategies for creators",
      category: "Marketing",
      trendScore: 76,
      platforms: ["facebook", "instagram"],
      growth: 31,
      href: "#",
    },
    {
      id: "trend-5",
      title: "#WebDevelopment",
      description: "Web development trends",
      category: "Development",
      trendScore: 71,
      platforms: ["twitter"],
      growth: 28,
      href: "#",
    },
  ];
};

export function mapTrendingSearchResponse(
  response: TrendingSearchApiResponse
): TrendingResponse {
  return {
    timestamp: response.generatedAt ?? "",
    items: response.items.map((item) => ({
      id: `trending-search-${item.rank}-${encodeURIComponent(item.normalizedQuery)}`,
      title: item.query,
      category: "search",
      trendScore: Number.isFinite(item.score)
        ? Math.round(item.score * 100) / 100
        : 0,
      platforms: [],
      href: `/discover?q=${encodeURIComponent(item.query)}`,
    })),
  };
}

export async function loadTrending(
  isAuthenticated: boolean,
  useMockData: boolean
): Promise<TrendingResponse> {
  // Discover currently opts into fixtures for guests. Once session hydration
  // confirms an owner, live personalized data must win over that fallback.
  if (useMockData && !isAuthenticated) {
    return {
      items: generateMockTrending(),
      timestamp: new Date().toISOString(),
    };
  }

  const response = isAuthenticated
    ? await apiClient.Search.getPersonalizedTrendingSearch(10)
    : await apiClient.Search.getTrendingSearch(10);
  const mapped = mapTrendingSearchResponse(response);

  // A new installation can legitimately have no qualifying search history yet.
  // Keep Discover useful during that warm-up period, including after login,
  // while still preferring live results whenever the backend has any.
  if (useMockData && mapped.items.length === 0) {
    return {
      items: generateMockTrending(),
      timestamp: new Date().toISOString(),
    };
  }

  return mapped;
}

/**
 * Custom hook for fetching and managing trending content
 */
export const useTrending = (
  platforms?: string[],
  useMockData: boolean = false
) => {
  const isAuthenticated = useAuthUserStore((state) => state.isAuthenticated);
  const [state, setState] = useState<UseTrendingState>({
    items: [],
    isLoading: true,
    isError: false,
    error: null,
  });

  useEffect(() => {
    const fetchTrending = async () => {
      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        const response = await loadTrending(isAuthenticated, useMockData);

        setState({
          items: response.items,
          isLoading: false,
          isError: false,
          error: null,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch trending");
        setState({
          items: useMockData ? generateMockTrending() : [],
          isLoading: false,
          isError: !useMockData,
          error: useMockData ? null : error,
        });
      }
    };

    fetchTrending();
  }, [isAuthenticated, platforms, useMockData]);

  return state;
};
