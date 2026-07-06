"use client";

import { create } from "zustand";

export type FollowEntry = {
	isFollowing: boolean;
	followersCount: number;
};

type FollowStore = {
	follows: Record<string, FollowEntry>;
	setFollow: (userId: string, state: FollowEntry) => void;
};

export const useFollowStore = create<FollowStore>((set) => ({
	follows: {},
	setFollow: (userId, state) =>
		set((prev) => ({
			follows: { ...prev.follows, [userId]: state },
		})),
}));

export function useSetFollowEntry() {
	return useFollowStore((s) => s.setFollow);
}
