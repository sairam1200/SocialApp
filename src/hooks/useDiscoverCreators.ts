import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient.service";
import { PublicProfileModel } from "@/types/account/profile.type";

type DiscoverCreatorsState = {
	profiles: PublicProfileModel[];
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	page: number;
	totalResults: number;
	hasNextPage: boolean;
};

export const useDiscoverCreators = (limit = 12) => {
	const [state, setState] = useState<DiscoverCreatorsState>({
		profiles: [],
		isLoading: true,
		isError: false,
		error: null,
		page: 1,
		totalResults: 0,
		hasNextPage: false,
	});

	const loadPage = useCallback(
		async (page = 1) => {
			setState((prev) => ({ ...prev, isLoading: true, isError: false, error: null }));

			try {
				const response = await apiClient.User.getDiscoverCreators(page, limit);
				setState({
					profiles: response.profiles ?? [],
					isLoading: false,
					isError: false,
					error: null,
					page: response.page ?? page,
					totalResults: response.totalResults ?? response.profiles?.length ?? 0,
					hasNextPage:
						response.hasNextPage ?? (response.page ?? page) * (response.limit ?? limit) < (response.totalResults ?? 0),
				});
			} catch (error) {
				setState((prev) => ({
					...prev,
					isLoading: false,
					isError: true,
					error: error instanceof Error ? error : new Error("Unable to load creators"),
				}));
			}
		},
		[limit]
	);

	useEffect(() => {
		loadPage(1);
	}, [loadPage]);

	return {
		...state,
		nextPage: () => state.hasNextPage && loadPage(state.page + 1),
		previousPage: () => state.page > 1 && loadPage(state.page - 1),
		retry: () => loadPage(state.page),
	};
};
