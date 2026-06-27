import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";

type FollowState = {
	isFollowing: boolean;
	followersCount: number;
};

type UseFollowUserOptions = FollowState & {
	userId?: string;
	onChange?: (state: FollowState) => void;
};

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

const getStatusCode = (error: unknown) => {
	if (typeof error !== "object" || error === null) return undefined;
	const maybeError = error as { status?: number; response?: { status?: number } };
	return maybeError.status ?? maybeError.response?.status;
};

export const useFollowUser = ({
	userId,
	isFollowing: initialIsFollowing,
	followersCount: initialFollowersCount,
	onChange,
}: UseFollowUserOptions) => {
	const [state, setState] = useState<FollowState>({
		isFollowing: initialIsFollowing,
		followersCount: initialFollowersCount,
	});
	const [isPending, setIsPending] = useState(false);
	const inFlightRef = useRef(false);

	useEffect(() => {
		setState({
			isFollowing: initialIsFollowing,
			followersCount: initialFollowersCount,
		});
	}, [initialFollowersCount, initialIsFollowing]);

	const commitState = useCallback(
		(nextState: FollowState) => {
			setState(nextState);
			onChange?.(nextState);
		},
		[onChange]
	);

	const toggleFollow = useCallback(async () => {
		if (!userId || inFlightRef.current) return;

		const previousState = state;
		const nextState = {
			isFollowing: !state.isFollowing,
			followersCount: Math.max(0, state.followersCount + (state.isFollowing ? -1 : 1)),
		};

		inFlightRef.current = true;
		setIsPending(true);
		commitState(nextState);

		const request = nextState.isFollowing
			? () => apiClient.User.followUser(userId)
			: () => apiClient.User.unfollowUser(userId);

		try {
			await request();
		} catch (error) {
			const statusCode = getStatusCode(error);

			if (statusCode && RETRYABLE_STATUS_CODES.has(statusCode)) {
				try {
					await request();
					return;
				} catch (retryError) {
					error = retryError;
				}
			}

			commitState(previousState);
			if (getStatusCode(error) === 429) {
				toast.error("Daily follow limit reached. Please try again later.");
			} else {
				toast.error("Unable to update follow status. Please try again.");
			}
		} finally {
			inFlightRef.current = false;
			setIsPending(false);
		}
	}, [commitState, state, userId]);

	return {
		...state,
		isPending,
		toggleFollow,
		canFollow: Boolean(userId),
	};
};
