"use client";

import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useQueryClient } from "@tanstack/react-query";
import { LinkedAccountType } from "@/types/account/profile.type";

interface ProfileUpdatePayload {
  userId: string;
  updates: {
    linkedAccounts?: LinkedAccountType[];
    totalPosts?: number;
    [key: string]: unknown;
  };
}

export function useProfileSocket() {
  const { notificationsSocket } = useWebSocket();
  const authUser = useAuthUserStore((s) => s.authUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!notificationsSocket) return;

    const handler = (payload: ProfileUpdatePayload) => {
      const currentUserId = authUser?.id;
      const currentUsername = authUser?.username;

      if (!currentUserId) return;
      if (payload.userId !== currentUserId) return;

      const ownProfileKey = ["user", "profile", currentUsername];

      queryClient.setQueryData(ownProfileKey, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const profile = { ...(old as Record<string, unknown>) };
        if (payload.updates.linkedAccounts) {
          profile.linkedAccounts = payload.updates.linkedAccounts;
        }
        if (payload.updates.totalPosts !== undefined) {
          profile.totalPosts = payload.updates.totalPosts;
        }
        if (payload.updates.photo !== undefined) {
          profile.photo = payload.updates.photo;
        }
        return profile;
      });
    };

    notificationsSocket.on("profile-update", handler);

    return () => {
      notificationsSocket.off("profile-update", handler);
    };
  }, [notificationsSocket, authUser?.id, authUser?.username, queryClient]);
}
