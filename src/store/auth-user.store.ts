"use client";

import { create } from "zustand";
import { AuthUserType } from "@/types/auth/authUser.type";

type AuthUserStore = {
	authUser: AuthUserType | null;
	isAuthenticated: boolean;
	setAuthUser: (user: AuthUserType | null) => void;
	updateAuthUser: (updates: Partial<AuthUserType>) => void;
	clearAuthUser: () => void;
};

export const useAuthUserStore = create<AuthUserStore>((set) => ({
	authUser: null,
	isAuthenticated: false,
	setAuthUser: (authUser) => set({ authUser, isAuthenticated: !!authUser }),
	updateAuthUser: (updates) =>
		set((state) => (state.authUser ? { authUser: { ...state.authUser, ...updates } } : state)),
	clearAuthUser: () => {
    set({ authUser: null, isAuthenticated: false });

    if (typeof window !== "undefined") {
      localStorage.removeItem("deviceId");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("pendingEmailChange");
    }
  },
}));
