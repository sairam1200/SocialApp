import { useDebounce } from '@/hooks/useDebounce';
import { useState, useCallback, useEffect, useRef } from "react";
import { apiClient } from "@/services/apiClient.service";
import {
  SearchRequest,
  SearchResult,
  PaginationTokens,
  SearchFilter,
} from "@/types/search.types";
import { de } from 'date-fns/locale';

export interface UseSearchOptions {
  debounceMs?: number;
  useMockData?: boolean;
}

export interface UseSearchState {
  results: SearchResult[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  totalResults: number;
  hasNextPage: boolean;
  paginationTokens: PaginationTokens;
}

/**
 * Mock data generator for development/testing
 */
const generateMockResults = (query: string, page: number = 1): SearchResult[] => {
  const mockTypes = ["post", "profile", "video", "reel"] as const;
  const mockPlatforms = ["twitter", "instagram", "facebook", "youtube", "tiktok"];
  const itemsPerPage = 12;
  const totalItems = 100;

  const results: SearchResult[] = [];

  for (
    let i = (page - 1) * itemsPerPage;
    i < Math.min(page * itemsPerPage, totalItems);
    i++
  ) {
    const mockType = mockTypes[i % mockTypes.length];
    const mockPlatform = mockPlatforms[i % mockPlatforms.length];

    const result: SearchResult = {
      id: `mock-${mockPlatform}-${i}`,
      type: mockType,
      platform: mockPlatform,
      title: `${query} - Result ${i + 1}`,
      description: `This is a mock ${mockType} result for search term "${query}"`,
      content: `Content about ${query} from ${mockPlatform}`,
      author: {
        id: `user-${i}`,
        name: `Creator ${i}`,
        handle: `@creator${i}`,
        profileImage: `/icons/gaddr-logo-xs.svg`,
      },
      media: {
        type: mockType === "video" || mockType === "reel" ? "video" : "image",
        url: "/icons/gaddr-logo-xs.svg",
        thumbnailUrl: "/icons/gaddr-logo-xs.svg",
      },
      engagement: {
        views: Math.floor(Math.random() * 50000) + 1000,
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: Math.floor(Math.random() * 1000) + 10,
        shares: Math.floor(Math.random() * 500),
      },
      url: `https://${mockPlatform}.com/result-${i}`,
      publishedAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    results.push(result);
  }

  return results;
};

/**
 * Custom hook for managing search functionality
 * Handles search queries, pagination, loading states, and error handling
 */
export const useSearch = (options: UseSearchOptions = {}) => {
  const { debounceMs = 300, useMockData = false } = options;

  const [state, setState] = useState<UseSearchState>({
    results: [],
    isLoading: false,
    isError: false,
    error: null,
    page: 1,
    totalResults: 0,
    hasNextPage: false,
    paginationTokens: {},
  });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);


  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  /**
   * Perform search with given parameters
   */
  const search = useCallback(
    async (
      searchTerm: string,
      platforms: string[],
      filter?: SearchFilter,
      page: number = 1
    ) => {
      if (!searchTerm.trim()) {
        setState((prev) => ({
          ...prev,
          results: [],
          totalResults: 0,
          hasNextPage: false,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, isError: false }));

      try {
        if (useMockData) {
          // Use mock data
          const mockResults = generateMockResults(searchTerm, page);

          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Use mock results directly
          setState((prev) => ({
            ...prev,
            results: mockResults,
            totalResults: 100,
            page: page,
            hasNextPage: page * 12 < 100,
            paginationTokens: {},
            isLoading: false,
            isError: false,
            error: null,
          }));
          return;
        } else {
          // Call actual API
          const searchRequest: SearchRequest = {
            query: searchTerm,
            platforms,
            filter,
            page,
            limit: 12,
            paginationTokens: state.paginationTokens,
          };

          const response = await apiClient.Search.search(searchRequest);

          // Normalize the platform-specific results into a flat array
          const normalized = apiClient.Search.normalizeResults(response);

          setState((prev) => ({
            ...prev,
            results: normalized.results,
            totalResults: normalized.totalResults,
            page: response.page,
            hasNextPage: page * 12 < normalized.totalResults,
            paginationTokens: normalized.paginationTokens || {},
            isLoading: false,
            isError: false,
            error: null,
          }));
          return;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Search failed");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
          error,
          results: [],
        }));
      }
    },
    [state.paginationTokens, useMockData]
  );

  /**
   * Debounced search - automatically called after typing pauses 
   * issue timer doesnt reset on every call
   * this is a problem because if user types and then unfocuses once the timer is set, the timer will still be active
   */


  const debouncedSearch = useCallback(
    (
      searchTerm: string,
      platforms: string[],
      filter?: SearchFilter,
      page: number = 1
    ) => {

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        search(searchTerm, platforms, filter, page);
      }, debounceMs);

    },
    [search, debounceMs]
  );

  /**
   * Go to next page
   */
  const nextPage = useCallback(
    async (
      searchTerm: string,
      platforms: string[],
      filter?: SearchFilter
    ) => {
      if (state.hasNextPage) {
        await search(searchTerm, platforms, filter, state.page + 1);
      }
    },
    [search, state.page, state.hasNextPage]
  );

  /**
   * Go to previous page
   */
  const previousPage = useCallback(
    async (
      searchTerm: string,
      platforms: string[],
      filter?: SearchFilter
    ) => {
      if (state.page > 1) {
        await search(searchTerm, platforms, filter, state.page - 1);
      }
    },
    [search, state.page]
  );

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    search,
    debouncedSearch,
    nextPage,
    previousPage,
  };
};
