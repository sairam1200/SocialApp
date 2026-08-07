import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchResultEngagementStats } from "@/services/api/search.service";
import { useContentStreamEngagementSocket } from "./useContentStreamEngagementSocket";

const contentStreamId = "8d8a0f03-e46c-45aa-9be4-3f31aa2f859e";
const handlers = new Map<string, (...args: never[]) => void>();
const socket = {
  connected: true,
  emit: vi.fn(),
  on: vi.fn((event: string, handler: (...args: never[]) => void) => {
    handlers.set(event, handler);
  }),
  off: vi.fn((event: string) => {
    handlers.delete(event);
  }),
};

vi.mock("@/contexts/WebSocketContext", () => ({
  useWebSocket: () => ({ engagementSocket: socket }),
}));

describe("useContentStreamEngagementSocket", () => {
  beforeEach(() => {
    handlers.clear();
    vi.clearAllMocks();
  });

  it("subscribes, receives matching live stats, and unsubscribes", () => {
    const onStats = vi.fn<(stats: SearchResultEngagementStats) => void>();
    const { unmount } = renderHook(() =>
      useContentStreamEngagementSocket(contentStreamId, onStats),
    );

    expect(socket.emit).toHaveBeenCalledWith(
      "content-stream.engagement.subscribe",
      { contentStreamId },
    );

    handlers.get("content-stream.engagement.updated")?.({
      contentStreamId,
      views: "14",
      externalClicks: "5",
    } as never);

    expect(onStats).toHaveBeenCalledWith({
      views: "14",
      externalClicks: "5",
    });

    unmount();
    expect(socket.emit).toHaveBeenCalledWith(
      "content-stream.engagement.unsubscribe",
      { contentStreamId },
    );
  });

  it("ignores updates for another result", () => {
    const onStats = vi.fn<(stats: SearchResultEngagementStats) => void>();
    renderHook(() => useContentStreamEngagementSocket(contentStreamId, onStats));

    handlers.get("content-stream.engagement.updated")?.({
      contentStreamId: "28335530-3f3a-4d69-9b64-dde487289141",
      views: "99",
      externalClicks: "8",
    } as never);

    expect(onStats).not.toHaveBeenCalled();
  });

  it("keeps a shared room subscribed until the final matching card unmounts", () => {
    const first = renderHook(() =>
      useContentStreamEngagementSocket(contentStreamId, vi.fn()),
    );
    const second = renderHook(() =>
      useContentStreamEngagementSocket(contentStreamId, vi.fn()),
    );

    expect(socket.emit).toHaveBeenCalledTimes(1);

    first.unmount();
    expect(socket.emit).not.toHaveBeenCalledWith(
      "content-stream.engagement.unsubscribe",
      { contentStreamId },
    );

    second.unmount();
    expect(socket.emit).toHaveBeenCalledWith(
      "content-stream.engagement.unsubscribe",
      { contentStreamId },
    );
  });
});
