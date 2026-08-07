import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import type { SearchResultEngagementStats } from "@/services/api/search.service";
import type { Socket } from "socket.io-client";

interface ContentStreamEngagementPayload extends SearchResultEngagementStats {
  contentStreamId: string;
}

const subscriptionCounts = new WeakMap<Socket, Map<string, number>>();

function subscriptionsFor(socket: Socket): Map<string, number> {
  const existing = subscriptionCounts.get(socket);
  if (existing) return existing;

  const subscriptions = new Map<string, number>();
  subscriptionCounts.set(socket, subscriptions);
  return subscriptions;
}

export function useContentStreamEngagementSocket(
  contentStreamId: string | undefined,
  onStats: (stats: SearchResultEngagementStats) => void,
): void {
  const { engagementSocket } = useWebSocket();

  useEffect(() => {
    if (!engagementSocket || !contentStreamId) return;

    const subscription = { contentStreamId };
    const subscriptions = subscriptionsFor(engagementSocket);
    const subscriberCount = (subscriptions.get(contentStreamId) ?? 0) + 1;
    subscriptions.set(contentStreamId, subscriberCount);

    const subscribe = () => {
      engagementSocket.emit(
        "content-stream.engagement.subscribe",
        subscription,
      );
    };
    const handleUpdate = (payload: ContentStreamEngagementPayload) => {
      if (payload.contentStreamId !== contentStreamId) return;
      onStats({
        views: payload.views,
        externalClicks: payload.externalClicks,
      });
    };

    engagementSocket.on("connect", subscribe);
    engagementSocket.on(
      "content-stream.engagement.updated",
      handleUpdate,
    );

    if (engagementSocket.connected && subscriberCount === 1) subscribe();

    return () => {
      const remaining = (subscriptions.get(contentStreamId) ?? 1) - 1;
      if (remaining <= 0) {
        subscriptions.delete(contentStreamId);
        engagementSocket.emit(
          "content-stream.engagement.unsubscribe",
          subscription,
        );
      } else {
        subscriptions.set(contentStreamId, remaining);
      }
      engagementSocket.off("connect", subscribe);
      engagementSocket.off(
        "content-stream.engagement.updated",
        handleUpdate,
      );
    };
  }, [contentStreamId, engagementSocket, onStats]);
}
