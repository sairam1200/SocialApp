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
      if (!payload.updates?.linkedAccounts) return;

      const ownProfileKey = ["user", "profile", currentUsername];

      queryClient.setQueryData(ownProfileKey, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return {
          ...(old as Record<string, unknown>),
          linkedAccounts: payload.updates.linkedAccounts,
        };
      });
    };

    notificationsSocket.on("profile-update", handler);

    return () => {
      notificationsSocket.off("profile-update", handler);
    };
  }, [notificationsSocket, authUser?.id, authUser?.username, queryClient]);
}
