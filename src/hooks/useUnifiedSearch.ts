"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "@/services/apiClient.service";
import type {
	SearchMode,
	SearchResultItem,
	UnifiedSearchResponse,
} from "@/types/unified-search.type";

export const unifiedSearchKeys = {
	all: ["unified-search"] as const,
	query: (
		keyword: string,
		mode: SearchMode,
		platforms: string,
		kinds: string,
		topics: string,
		seed: string,
	) =>
		["unified-search", keyword, mode, platforms, kinds, topics, seed] as const,
};

const PAGE_SIZE = 24;

export interface UseUnifiedSearchOptions {
	keyword: string;
	mode: SearchMode;
	platforms?: string[];
	kinds?: string[];
	topics?: string[];
	enabled?: boolean;
}

/**
 * Search everything, paginated.
 *
 * The seed is derived from the query rather than generated per render. Random
 * mode is deterministic per seed on the server, and a seed that changed on
 * every render would reshuffle page 1 the moment page 2 loaded — the classic
 * way naive shuffling breaks pagination.
 */
export function useUnifiedSearch({
	keyword,
	mode,
	platforms = [],
	kinds = [],
	topics = [],
	enabled = true,
}: UseUnifiedSearchOptions) {
	const platformParam = platforms.join(",");
	const kindParam = kinds.join(",");
	const topicParam = topics.join(",");
	const seed = useMemo(() => `${keyword}:${mode}`, [keyword, mode]);

	const query = useInfiniteQuery<UnifiedSearchResponse>({
		queryKey: unifiedSearchKeys.query(
			keyword,
			mode,
			platformParam,
			kindParam,
			topicParam,
			seed,
		),
		initialPageParam: 1,
		queryFn: ({ pageParam }) =>
			apiClient.Community.unifiedSearch(
				keyword,
				mode,
				pageParam as number,
				PAGE_SIZE,
				platformParam || undefined,
				kindParam || undefined,
				topicParam || undefined,
				seed,
			),
		getNextPageParam: (last, pages) =>
			last.hasMore ? pages.length + 1 : undefined,
		enabled,
		staleTime: 60_000,
	});

	const items: SearchResultItem[] = useMemo(() => {
		const seen = new Set<string>();
		const flat: SearchResultItem[] = [];
		for (const page of query.data?.pages ?? []) {
			for (const item of page.items) {
				// The same result can arrive from two sources; show it once, and
				// keep the first position so the list does not jump.
				if (seen.has(item.id)) continue;
				seen.add(item.id);
				flat.push(item);
			}
		}
		return flat;
	}, [query.data?.pages]);

	// Facets come from the first page: they describe the whole result set
	// before paging, so later pages repeat them unchanged.
	const facets = query.data?.pages[0];

	return {
		...query,
		items,
		sources: facets?.sources ?? [],
		kinds: facets?.kinds ?? [],
		topics: facets?.topics ?? [],
		total: facets?.total ?? 0,
	};
}
