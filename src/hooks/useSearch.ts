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
  platforms?: string[];
}

export interface UseSearchState {
  results: SearchResult[];
  totalResults: number;
  profilesTotal: number;
  contentsTotal: number;
  projectsTotal: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  search: (term: string) => void;
  debouncedSearch: (term: string) => void;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    useMockData = false,
    page = 1,
    limit = 12,
    enabled = true,
    platforms,
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [...queryKeys.searchResults(searchTerm, page, limit), platforms],
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
          totalResults: totalItems,
          profilesTotal: 40,
          contentsTotal: 60,
          projectsTotal: 0,
          page,
        };
      }

      const response = await apiClient.Search.searchUnifiedContent({
        searchTerm: searchTerm.trim(),
        platforms: platforms && platforms.length > 0 ? platforms : undefined,
        page,
        limit,
      });

      // TODO: REMOVE AFTER SEARCH DEBUGGING
      if (process.env.NODE_ENV === 'development') {
        console.log('[SEARCH DEBUG]');
        console.log('API Success');
        const allItems: any[] = [];
        for (const [, items] of Object.entries(response.results)) {
          allItems.push(...(items as any[]));
        }
        const p = allItems.filter((i: any) => (i.type || '').toLowerCase() === 'profile').length;
        const c = allItems.filter((i: any) => (i.type || '').toLowerCase() !== 'profile' && (i.type || '').toLowerCase() !== 'project').length;
        const pr = allItems.filter((i: any) => (i.type || '').toLowerCase() === 'project').length;
        console.log(`Profiles: ${p}`);
        console.log(`Contents: ${c}`);
        console.log(`Projects: ${pr}`);
        console.log(`Total: ${response.totalResults}`);
        console.log('[SEARCH DEBUG]');
        console.log(`Response received`);
        console.log(`Length: ${allItems.length}`);
      }

      const normalized = apiClient.Search.normalizeHybridResults(response);

      // TODO: REMOVE AFTER SEARCH DEBUGGING
      if (process.env.NODE_ENV === 'development') {
        console.log('[SEARCH DEBUG]');
        console.log('Hook');
        console.log(`Profiles: ${normalized.profilesTotal}`);
        console.log(`Contents: ${normalized.contentsTotal}`);
        console.log(`Projects: ${normalized.projectsTotal}`);
      }

      return {
        results: normalized.results,
        totalResults: response.totalResults ?? 0,
        profilesTotal: normalized.profilesTotal,
        contentsTotal: normalized.contentsTotal,
        projectsTotal: normalized.projectsTotal,
        page: response.page,
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
    totalResults: data?.totalResults ?? 0,
    profilesTotal: data?.profilesTotal ?? 0,
    contentsTotal: data?.contentsTotal ?? 0,
    projectsTotal: data?.projectsTotal ?? 0,
    isLoading,
    isFetching,
    isError,
    error: error instanceof Error ? error : null,
    search,
    debouncedSearch,
  };
};
