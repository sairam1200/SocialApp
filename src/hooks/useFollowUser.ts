import { useCallback } from "react";
import { useFollowStore } from "@/store/follow.store";
import { useFollowUserMutation } from "@/hooks/useFollowUserMutation";

type UseFollowUserOptions = {
	userId?: string;
	isFollowing?: boolean;
	followersCount?: number;
	isOwnProfile?: boolean;
};

export const useFollowUser = ({
	userId,
	isFollowing: initialIsFollowing,
	followersCount: initialFollowersCount,
	isOwnProfile,
}: UseFollowUserOptions) => {
	const storeEntry = useFollowStore((s) => (userId ? s.follows[userId] : undefined));
	const mutation = useFollowUserMutation();

	const isFollowing = storeEntry?.isFollowing ?? initialIsFollowing ?? false;
	const followersCount = storeEntry?.followersCount ?? initialFollowersCount ?? 0;

	const toggleFollow = useCallback(async () => {
		if (!userId || isOwnProfile || mutation.isPending) return;
		mutation.mutate({ userId, isFollowing: !isFollowing });
	}, [userId, isOwnProfile, mutation, isFollowing]);

	return {
		isFollowing,
		followersCount,
		isPending: mutation.isPending,
		toggleFollow,
		canFollow: Boolean(userId) && !isOwnProfile,
	};
};
