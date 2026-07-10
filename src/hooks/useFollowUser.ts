import React, { useCallback } from "react";
import { useFollowStore } from "@/store/follow.store";
import { useFollowUserMutation } from "@/hooks/useFollowUserMutation";

type UseFollowUserOptions = {
	userId?: string;
	isFollowing?: boolean;
	followersCount?: number;
	followingCount?: number;
	isOwnProfile?: boolean;
};

export const useFollowUser = ({
	userId,
	isFollowing: initialIsFollowing,
	followersCount: initialFollowersCount,
	followingCount: initialFollowingCount,
	isOwnProfile,
}: UseFollowUserOptions) => {
	const storeEntry = useFollowStore((s) => (userId ? s.follows[userId] : undefined));
	const mutation = useFollowUserMutation();

	// Belt-and-suspenders: manual subscription as a safety net for potential
	// useSyncExternalStore + inline selector instability with React 19.
	const [, forceRender] = React.useReducer((x: number) => x + 1, 0);
	React.useEffect(() => {
		if (!userId) return;
		const unsub = useFollowStore.subscribe((state, prevState) => {
			if (state.follows[userId] !== prevState.follows[userId]) {
				forceRender();
			}
		});
		return unsub;
	}, [userId]);

	const isFollowing = storeEntry?.isFollowing ?? initialIsFollowing ?? false;
	const followersCount = storeEntry?.followersCount ?? initialFollowersCount ?? 0;
	const followingCount = storeEntry?.followingCount ?? initialFollowingCount ?? 0;

	const toggleFollow = useCallback(async () => {
		if (!userId || isOwnProfile || mutation.isPending) return;
		mutation.mutate({ userId, isFollowing: !isFollowing });
	}, [userId, isOwnProfile, mutation, isFollowing]);

	return {
		isFollowing,
		followersCount,
		followingCount,
		isPending: mutation.isPending,
		toggleFollow,
		canFollow: Boolean(userId) && !isOwnProfile,
	};
};
