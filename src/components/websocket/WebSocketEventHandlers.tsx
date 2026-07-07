"use client";

import { useSessionSecurity } from "@/hooks/useSessionSecurity";
import { useNotifications } from "@/hooks/useNotifications";
import { useImports } from "@/hooks/useImports";
import { useFollowSocket } from "@/hooks/useFollowSocket";
import { useProfileSocket } from "@/hooks/useProfileSocket";

export function WebSocketEventHandlers() {
  useSessionSecurity();
  useNotifications();
  useImports();
  useFollowSocket();
  useProfileSocket();
  return null;
}
