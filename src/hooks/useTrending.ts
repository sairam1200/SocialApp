import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient.service";
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

/**
 * Custom hook for fetching and managing trending content
 */
export const useTrending = (
  platforms?: string[],
  useMockData: boolean = false
) => {
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
        let response: TrendingResponse;

        if (useMockData) {
          // Use mock data
          response = {
            items: generateMockTrending(),
            timestamp: new Date().toISOString(),
          };

          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 400));
        } else {
          // Call actual API
          response = await apiClient.Search.getTrending(
            platforms?.join(","),
            10
          );
        }

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
  }, [platforms, useMockData]);

  return state;
};
