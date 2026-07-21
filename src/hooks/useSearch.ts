import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient.service";
import { queryKeys } from "@/lib/query-keys";
import type { SearchResult } from "@/types/search.types";

export interface UseSearchOptions {
  debounceMs?: number;
  useMockData?: boolean;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export interface UseSearchState {
  results: SearchResult[];
  profilesTotal: number;
  contentsTotal: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  search: (term: string) => void;
  debouncedSearch: (term: string) => void;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const { debounceMs = 300, useMockData = false, page = 1, limit = 12, enabled = true } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.searchResults(searchTerm, page, limit),
    queryFn: async () => {
      if (useMockData) {
        const totalItems = 100;
        const mockResults = Array.from({ length: Math.min(limit, totalItems) }, (_, i) => ({
          id: `mock-${i}`,
          type: "post" as const,
          platform: "mock",
          title: `Mock result ${i + 1}`,
        }));
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          results: mockResults,
          profilesTotal: 40,
          contentsTotal: 60,
          page,
        };
      }
      const response = await apiClient.Search.getGlobalResults(searchTerm.trim(), page, limit);
      const normalized = apiClient.Search.normalizeGlobalResults(response);
      return {
        results: normalized.results,
        profilesTotal: response.pagination.profiles.total,
        contentsTotal: response.pagination.contents.total,
        page: response.pagination.page,
      };
    },
    enabled: enabled && !!searchTerm.trim(),
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

  return {
    results: data?.results ?? [],
    profilesTotal: data?.profilesTotal ?? 0,
    contentsTotal: data?.contentsTotal ?? 0,
    isLoading,
    isFetching,
    isError,
    error: error instanceof Error ? error : null,
    search,
    debouncedSearch,
  };
};
