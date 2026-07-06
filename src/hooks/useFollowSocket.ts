"use client";

import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAuthUserStore } from "@/store/auth-user.store";
import { useFollowStore } from "@/store/follow.store";
import { useQueryClient } from "@tanstack/react-query";

interface FollowUpdatedPayload {
  targetUserId: string;
  viewerUserId: string;
  isFollowing: boolean;
  targetFollowersCount: number;
  viewerFollowingCount: number;
}

export function useFollowSocket() {
  const { notificationsSocket } = useWebSocket();
  const authUser = useAuthUserStore((s) => s.authUser);
  const setFollow = useFollowStore((s) => s.setFollow);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!notificationsSocket) return;

    const handler = (payload: FollowUpdatedPayload) => {
      const currentUserId = authUser?.id;
      const currentUsername = authUser?.username;

      if (!currentUserId) return;

      const existingTarget = useFollowStore.getState().follows[payload.targetUserId];

      if (existingTarget) {
        setFollow(payload.targetUserId, {
          ...existingTarget,
          followersCount: payload.targetFollowersCount,
        });
      }

      if (payload.viewerUserId === currentUserId) {
        setFollow(payload.targetUserId, {
          isFollowing: payload.isFollowing,
          followersCount: payload.targetFollowersCount,
        });
      }

      if (currentUsername) {
        const ownProfileKey = ["user", "profile", currentUsername];
        queryClient.setQueryData(ownProfileKey, (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const profile = old as Record<string, unknown>;
          return {
            ...profile,
            followingCount:
              payload.viewerUserId === currentUserId
                ? payload.viewerFollowingCount
                : profile.followingCount,
            followersCount:
              payload.targetUserId === currentUserId
                ? payload.targetFollowersCount
                : profile.followersCount,
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["discover"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    };

    notificationsSocket.on("follow.updated", handler);

    return () => {
      notificationsSocket.off("follow.updated", handler);
    };
  }, [notificationsSocket, authUser?.id, authUser?.username, setFollow, queryClient]);
}
