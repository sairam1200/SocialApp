import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/services/apiClient.service";
import { useFollowStore } from "@/store/follow.store";
import { queryKeys } from "@/lib/query-keys";

export function useFollowUserMutation() {
	const queryClient = useQueryClient();
	const setFollow = useFollowStore((s) => s.setFollow);

	return useMutation({
		mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
			if (isFollowing) {
				await apiClient.User.followUser(userId);
			} else {
				await apiClient.User.unfollowUser(userId);
			}
		},
		onMutate: async ({ userId, isFollowing }) => {
			const prev = queryClient.getQueryData(queryKeys.followStatus(userId));
			const storeEntry = useFollowStore.getState().follows[userId];
			const currentEntry = storeEntry ?? { isFollowing: !isFollowing, followersCount: 0 };

			setFollow(userId, {
				isFollowing,
				followersCount: Math.max(0, currentEntry.followersCount + (isFollowing ? 1 : -1)),
			});

			return { prev, prevStore: currentEntry };
		},
		onError: (_err, { userId }, context) => {
			if (context?.prevStore) {
				setFollow(userId, context.prevStore);
			}
			const status = (_err as { status?: number })?.status;
			if (status === 429) {
				toast.error("Daily follow limit reached. Please try again later.");
			} else {
				toast.error("Unable to update follow status. Please try again.");
			}
		},
		// Fallback invalidation — the WebSocket (useFollowSocket) is the
		// primary sync mechanism. This serves as a safety net when the
		// WebSocket event fails to deliver. It does NOT mutate follow state.
		onSettled: (_data, _err, { userId }) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.followStatus(userId) });
		},
	});
}
