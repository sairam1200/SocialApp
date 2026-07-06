"use client";

import { create } from "zustand";

type AppUIStore = {
	discoverRefreshCount: number;
	triggerDiscoverRefresh: () => void;
};

export const useAppUIStore = create<AppUIStore>((set) => ({
	discoverRefreshCount: 0,
	triggerDiscoverRefresh: () =>
		set((state) => ({ discoverRefreshCount: state.discoverRefreshCount + 1 })),
}));
