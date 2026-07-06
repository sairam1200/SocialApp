"use client";

import { useSessionSecurity } from "@/hooks/useSessionSecurity";
import { useNotifications } from "@/hooks/useNotifications";
import { useImports } from "@/hooks/useImports";
import { useFollowSocket } from "@/hooks/useFollowSocket";

export function WebSocketEventHandlers() {
  useSessionSecurity();
  useNotifications();
  useImports();
  useFollowSocket();
  return null;
}
