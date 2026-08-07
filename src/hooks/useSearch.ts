import { useState, useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import { normalizeFlatSearchResults } from "@/lib/normalizers/search.normalizer";
import {
  SearchEntityType,
  SearchFacets,
  SearchResult,
} from "@/types/search.types";

const EMPTY_FACETS: SearchFacets = {
  [SearchEntityType.CONTENT]: 0,
  [SearchEntityType.PROFILE]: 0,
  [SearchEntityType.PROJECT]: 0,
  [SearchEntityType.JOB]: 0,
};

export interface UseSearchOptions {
  debounceMs?: number;
  page?: number;
  limit?: number;
  enabled?: boolean;
  platforms?: string[];
  forceRefresh?: boolean;
}

export interface UseSearchState {
  results: SearchResult[];
  totalResults: number;
  facets: SearchFacets;
  page: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  search: (term: string) => void;
  debouncedSearch: (term: string) => void;
  refresh: () => void;
  fetchNextPage: () => void;
}

let requestIdCounter = 0;

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    page = 1,
    limit = 12,
    enabled = true,
    platforms,
    forceRefresh = false,
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, isError, error } = useInfiniteQuery({
    queryKey: [...queryKeys.searchResults(searchTerm, page, limit), "infinite", platforms, refreshKey],
    queryFn: async ({ pageParam }) => {
      const currentRequestId = ++requestIdCounter;

      const response = await apiClient.Search.search({
        searchTerm: searchTerm.trim(),
        platforms: platforms && platforms.length > 0 ? platforms : undefined,
        cursor: pageParam as string | undefined,
        limit,
        forceRefresh: refreshKey > 0 || forceRefresh,
      });

      if (currentRequestId !== requestIdCounter) {
        return Promise.reject(new Error("Stale request"));
      }

      return {
        results: normalizeFlatSearchResults(response.items),
        totalResults: response.pagination.total,
        facets: response.facets,
        page: response.pagination.page,
        hasNextPage: response.pagination.hasMore,
        nextCursor: response.pagination.nextCursor,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && !!searchTerm.trim(),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const search = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchTerm("");
      return;
    }
    setRefreshKey(0);
    setSearchTerm(term);
  }, []);

  const debouncedSearch = useCallback(
    (term: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        search(term);
      }, debounceMs);
    },
    [search, debounceMs]
  );

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const results = Array.from(
    new Map(
      (data?.pages.flatMap((currentPage) => currentPage.results) ?? []).map((result) => [`${result.type}:${result.id}`, result]),
    ).values(),
  );

  return {
    results,
    totalResults: data?.pages[0]?.totalResults ?? 0,
    facets: data?.pages[0]?.facets ?? EMPTY_FACETS,
    page: data?.pages.length ?? page,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error: error instanceof Error ? error : null,
    search,
    debouncedSearch,
    refresh,
    fetchNextPage,
  };
};
