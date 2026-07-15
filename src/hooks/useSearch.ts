import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import {
  SearchResult,
  PaginationTokens,
  SearchFilter,
} from "@/types/search.types";

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

export const useSearch = (options: UseSearchOptions = {}) => {
  const { debounceMs = 300, useMockData = false } = options;

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.searchResults(searchTerm, page, 12),
    queryFn: async () => {
      if (useMockData) {
        const mockResults = generateMockResults(searchTerm, page);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { results: mockResults, totalResults: 100 };
      }
      const response = await apiClient.Search.getGlobalResults(searchTerm.trim(), page, 12);
      const normalized = apiClient.Search.normalizeGlobalResults(response);
      return { results: normalized.results, totalResults: normalized.totalResults, page: response.pagination.page };
    },
    enabled: !!searchTerm.trim(),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (data) {
      setTotalResults(data.totalResults);
      setHasNextPage(page * 12 < data.totalResults);
    }
  }, [data, page]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const search = useCallback(
    async (
      term: string,
      _platforms: string[],
      _filter?: SearchFilter,
      pageNum: number = 1
    ) => {
      if (!term.trim()) {
        setSearchTerm("");
        setPage(1);
        setTotalResults(0);
        setHasNextPage(false);
        return;
      }
      setSearchTerm(term);
      setPage(pageNum);
    },
    []
  );

  const debouncedSearch = useCallback(
    (
      term: string,
      platforms: string[],
      filter?: SearchFilter,
      pageNum: number = 1
    ) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        search(term, platforms, filter, pageNum);
      }, debounceMs);
    },
    [search, debounceMs]
  );

  const nextPage = useCallback(
    async (
      term: string,
      platforms: string[],
      filter?: SearchFilter
    ) => {
      if (hasNextPage) {
        await search(term, platforms, filter, page + 1);
      }
    },
    [search, page, hasNextPage]
  );

  const previousPage = useCallback(
    async (
      term: string,
      platforms: string[],
      filter?: SearchFilter
    ) => {
      if (page > 1) {
        await search(term, platforms, filter, page - 1);
      }
    },
    [search, page]
  );

  return {
    results: data?.results ?? [],
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    page,
    totalResults,
    hasNextPage,
    paginationTokens: {},
    search,
    debouncedSearch,
    nextPage,
    previousPage,
  };
};
