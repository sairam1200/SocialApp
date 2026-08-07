import { beforeEach, describe, expect, it, vi } from "vitest";

type Entry = { key: string; [key: string]: unknown };

const tables = vi.hoisted(() => {
  const createTable = () => {
    const rows = new Map<string, Entry>();
    return {
      rows,
      get: vi.fn(async (key: string) => rows.get(key)),
      put: vi.fn(async (entry: Entry) => {
        rows.set(entry.key, entry);
      }),
      delete: vi.fn(async (key: string) => rows.delete(key)),
      clear: vi.fn(async () => rows.clear()),
    };
  };
  return { profiles: createTable(), contents: createTable() };
});

vi.mock("./db", () => ({
  ensureDbOpen: vi.fn().mockResolvedValue(true),
  getDb: () => ({
    discoverProfiles: tables.profiles,
    discoverContents: tables.contents,
  }),
}));

import {
  getCachedDiscoverFeed,
  setCachedDiscoverFeed,
  STALE_WINDOW,
} from "./discover-cache";

describe("discover IndexedDB cache privacy", () => {
  beforeEach(() => {
    tables.profiles.rows.clear();
    tables.contents.rows.clear();
    vi.clearAllMocks();
  });

  it("partitions the same feed by authenticated viewer", async () => {
    await setCachedDiscoverFeed(undefined, undefined, {
      contents: [{ id: "private-for-a" }] as never,
      nextCursor: null,
      hasMore: false,
    }, undefined, "viewer-a");

    expect(await getCachedDiscoverFeed(undefined, undefined, "viewer-a"))
      .toEqual(expect.objectContaining({
        data: expect.objectContaining({
          contents: [{ id: "private-for-a" }],
        }),
      }));
    expect(await getCachedDiscoverFeed(undefined, undefined, "viewer-b"))
      .toBeNull();
    expect(await getCachedDiscoverFeed()).toBeNull();
  });

  it("deletes entries once the bounded stale window expires", async () => {
    await setCachedDiscoverFeed(undefined, undefined, {
      contents: [{ id: "expired" }] as never,
      nextCursor: null,
      hasMore: false,
    }, -(STALE_WINDOW + 1), "viewer-a");

    expect(await getCachedDiscoverFeed(undefined, undefined, "viewer-a"))
      .toBeNull();
    expect(tables.contents.delete).toHaveBeenCalledTimes(1);
  });

  it("keeps a server removal tombstoned but accepts an authoritative reappearance", async () => {
    const response = (ids: string[]) => ({
      contents: ids.map((id) => ({ id })) as never,
      nextCursor: null,
      hasMore: false,
    });

    await setCachedDiscoverFeed(undefined, undefined, response(["a", "b"]), undefined, "viewer-a");
    await setCachedDiscoverFeed(undefined, undefined, response(["a"]), undefined, "viewer-a");

    const removed = await getCachedDiscoverFeed(undefined, undefined, "viewer-a");
    expect(removed?.data.contents).toEqual([{ id: "a" }]);

    await setCachedDiscoverFeed(undefined, undefined, response(["a", "b"]), undefined, "viewer-a");
    const restored = await getCachedDiscoverFeed(undefined, undefined, "viewer-a");
    expect(restored?.data.contents).toEqual([{ id: "a" }, { id: "b" }]);
  });
});
