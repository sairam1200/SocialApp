import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { PublicProfileModel } from "@/types/account/profile.type";
import { queryKeys } from "@/lib/query-keys";
import { hydrateFollowState } from "@/store/follow.store";

type UseDiscoverCreatorsReturn = {
	profiles: PublicProfileModel[];
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	page: number;
	totalResults: number;
	hasNextPage: boolean;
	nextPage: () => void;
	previousPage: () => void;
	retry: () => void;
};

export const useDiscoverCreators = (limit = 12): UseDiscoverCreatorsReturn => {
	const [page, setPage] = useState(1);
	const queryClient = useQueryClient();

	const queryKey = queryKeys.discoverCreators(page, limit);

	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const response = await apiClient.User.getDiscoverCreators(page, limit);
			const profiles = response.profiles ?? [];
			const totalResults = response.totalResults ?? profiles.length ?? 0;
			const hasNextPage =
				response.hasNextPage ?? (response.page ?? page) * (response.limit ?? limit) < totalResults;

			hydrateFollowState(profiles);

			return {
				profiles,
				page: response.page ?? page,
				totalResults,
				hasNextPage,
			};
		},
		staleTime: 10 * 60 * 1000,
	});

	const nextPage = useCallback(() => {
		if (query.data?.hasNextPage) {
			const next = page + 1;
			setPage(next);
		}
	}, [query.data?.hasNextPage, page]);

	const previousPage = useCallback(() => {
		if (page > 1) {
			setPage(page - 1);
		}
	}, [page]);

	return {
		profiles: query.data?.profiles ?? [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error instanceof Error ? query.error : query.error ? new Error(String(query.error)) : null,
		page: query.data?.page ?? page,
		totalResults: query.data?.totalResults ?? 0,
		hasNextPage: query.data?.hasNextPage ?? false,
		nextPage,
		previousPage,
		retry: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.discoverCreators(page, limit) });
		},
	};
};
