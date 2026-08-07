"use client";

import { create } from "zustand";

export type FollowEntry = {
	isFollowing: boolean;
	followersCount: number;
	followingCount: number;
};

type FollowStore = {
	follows: Record<string, FollowEntry>;
	setFollow: (userId: string, state: Partial<FollowEntry>) => void;
};

export const useFollowStore = create<FollowStore>((set) => ({
	follows: {},
	setFollow: (userId, state) =>
		set((prev) => ({
			follows: {
				...prev.follows,
				[userId]: { ...prev.follows[userId], ...state },
			},
		})),
}));

export function useSetFollowEntry() {
	return useFollowStore((s) => s.setFollow);
}

/** Minimal shape any API profile must provide for follow-state hydration. */
export type FollowProfile = {
	id?: string;
	isFollowing?: boolean;
	followersCount?: number;
	followingCount?: number;
};

/**
 * Seed (or overwrite) the follow store from an API profile response.
 *
 * Unlike the WebSocket handler (`useFollowSocket`), this is NOT authoritative.
 * It only updates fields the API actually provides, preserving any existing
 * store state for omitted fields.  This prevents stale API responses from
 * clobbering optimistic or WebSocket-corrected state.
 *
 * Accepts one profile or an array.  Skips items that lack all valid fields.
 */
export function hydrateFollowState(input: FollowProfile | FollowProfile[]): void {
	const profiles = Array.isArray(input) ? input : [input];
	const store = useFollowStore.getState();

	for (const profile of profiles) {
		if (!profile.id) continue;

		const hasFollowing = typeof profile.isFollowing === "boolean";
		const hasFollowersCount = typeof profile.followersCount === "number";
		const hasFollowingCount = typeof profile.followingCount === "number";

		if (!hasFollowing && !hasFollowersCount && !hasFollowingCount) continue;

		store.setFollow(profile.id, {
			...(hasFollowing ? { isFollowing: profile.isFollowing } : {}),
			...(hasFollowersCount ? { followersCount: profile.followersCount } : {}),
			...(hasFollowingCount ? { followingCount: profile.followingCount } : {}),
		});
	}
}
