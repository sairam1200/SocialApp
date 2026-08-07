import {
  ensureDbOpen,
  getDb,
  type DiscoverProfileEntry,
  type DiscoverContentEntry,
} from "./db";
import { type DiscoverFeedResponse } from "@/types/discover.type";

export const CACHE_TTL = {
  DISCOVER_PROFILE: 5 * 60 * 1000,
  DISCOVER_CONTENT: 5 * 60 * 1000,
};

export const STALE_WINDOW = 30 * 60 * 1000;
const GUEST_IDENTITY = "guest";

export interface CacheResult<T> {
  data: T;
  isStale: boolean;
  cachedAt: number;
}

async function withDb<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const ready = await ensureDbOpen();
    if (!ready) return fallback;
    return await fn();
  } catch {
    return fallback;
  }
}

export function discoverIdentityKey(viewerUserId?: string): string {
  return viewerUserId ? `user:${viewerUserId}` : GUEST_IDENTITY;
}

function cacheKey(
  kind: "profile" | "contents" | "feed",
  platform: string,
  subjectUserId: string,
  identityKey: string
): string {
  return `v2:${identityKey}:${kind}:${platform}:${subjectUserId}`;
}

function liveTombstones(
  tombstones: Record<string, number> | undefined,
  now = Date.now()
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(tombstones ?? {}).filter(([, expiresAt]) => expiresAt > now)
  );
}

function contentId(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("id" in value)) return null;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

async function readUnexpired<T extends { key: string; expiresAt: number }>(
  entry: T | undefined,
  remove: (key: string) => Promise<unknown>
): Promise<T | null> {
  if (!entry) return null;
  if (entry.expiresAt > Date.now()) return entry;
  await remove(entry.key);
  return null;
}

export async function getCachedProfile(
  platform: string,
  userId: string,
  viewerUserId?: string
): Promise<CacheResult<unknown> | null> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return null;
    const identityKey = discoverIdentityKey(viewerUserId);
    const key = cacheKey("profile", platform, userId, identityKey);
    const entry = await readUnexpired(
      await db.discoverProfiles.get(key),
      (expiredKey) => db.discoverProfiles.delete(expiredKey)
    );
    if (!entry) return null;
    return {
      data: entry.profile,
      isStale: Date.now() >= entry.staleAt,
      cachedAt: entry.cachedAt,
    };
  }, null);
}

export async function setCachedProfile(
  platform: string,
  userId: string,
  profile: unknown,
  ttl = CACHE_TTL.DISCOVER_PROFILE,
  viewerUserId?: string
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const now = Date.now();
    const identityKey = discoverIdentityKey(viewerUserId);
    const entry: DiscoverProfileEntry = {
      key: cacheKey("profile", platform, userId, identityKey),
      identityKey,
      profile,
      cachedAt: now,
      staleAt: now + ttl,
      expiresAt: now + ttl + STALE_WINDOW,
    };
    await db.discoverProfiles.put(entry);
  }, undefined);
}

export async function getCachedContent(
  platform: string,
  userId: string,
  viewerUserId?: string
): Promise<CacheResult<{ contents: unknown[]; nextCursor: string | null; hasMore: boolean }> | null> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return null;
    const identityKey = discoverIdentityKey(viewerUserId);
    const key = cacheKey("contents", platform, userId, identityKey);
    const entry = await readUnexpired(
      await db.discoverContents.get(key),
      (expiredKey) => db.discoverContents.delete(expiredKey)
    );
    if (!entry) return null;
    const tombstones = liveTombstones(entry.tombstones);
    return {
      data: {
        contents: entry.contents.filter((item) => {
          const id = contentId(item);
          return !id || !tombstones[id];
        }),
        nextCursor: entry.nextCursor,
        hasMore: entry.hasMore,
      },
      isStale: Date.now() >= entry.staleAt,
      cachedAt: entry.cachedAt,
    };
  }, null);
}

export async function setCachedContent(
  platform: string,
  userId: string,
  contents: unknown[],
  nextCursor: string | null,
  hasMore: boolean,
  ttl = CACHE_TTL.DISCOVER_CONTENT,
  viewerUserId?: string
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const now = Date.now();
    const identityKey = discoverIdentityKey(viewerUserId);
    const key = cacheKey("contents", platform, userId, identityKey);

    const existing = await db.discoverContents.get(key);
    const tombstones = buildTombstones(existing, contents, now + ttl + STALE_WINDOW);

    const entry: DiscoverContentEntry = {
      key,
      identityKey,
      contents: applyTombstones(contents, tombstones),
      tombstones,
      nextCursor,
      hasMore,
      cachedAt: now,
      staleAt: now + ttl,
      expiresAt: now + ttl + STALE_WINDOW,
    };
    await db.discoverContents.put(entry);
  }, undefined);
}

function buildTombstones(
  existing: DiscoverContentEntry | undefined,
  incoming: unknown[],
  expiresAt: number
): Record<string, number> {
  const tombstones = liveTombstones(existing?.tombstones);
  if (!existing) return tombstones;

  const incomingIds = new Set(incoming.map(contentId).filter(Boolean));
  for (const id of incomingIds) {
    if (id) delete tombstones[id];
  }
  for (const item of existing.contents) {
    const id = contentId(item);
    if (id && !incomingIds.has(id)) tombstones[id] = expiresAt;
  }
  return tombstones;
}

function applyTombstones(
  contents: unknown[],
  tombstones: Record<string, number>
): unknown[] {
  return contents.filter((item) => {
    const id = contentId(item);
    return !id || !tombstones[id];
  });
}

export async function invalidateDiscoverCache(
  platform: string,
  userId: string,
  viewerUserId?: string
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const identityKey = discoverIdentityKey(viewerUserId);
    await Promise.all([
      db.discoverProfiles.delete(cacheKey("profile", platform, userId, identityKey)),
      db.discoverContents.delete(cacheKey("contents", platform, userId, identityKey)),
    ]);
  }, undefined);
}

function discoverFeedKey(
  platform: string | undefined,
  userId: string | undefined,
  identityKey: string
): string {
  return cacheKey("feed", platform || "all", userId || "all", identityKey);
}

export async function getCachedDiscoverFeed(
  platform?: string,
  userId?: string,
  viewerUserId?: string,
): Promise<CacheResult<DiscoverFeedResponse> | null> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return null;
    const identityKey = discoverIdentityKey(viewerUserId);
    const entry = await readUnexpired(
      await db.discoverContents.get(discoverFeedKey(platform, userId, identityKey)),
      (expiredKey) => db.discoverContents.delete(expiredKey)
    );
    if (!entry) return null;
    const tombstones = liveTombstones(entry.tombstones);
    return {
      data: {
        contents: applyTombstones(entry.contents, tombstones) as DiscoverFeedResponse["contents"],
        nextCursor: entry.nextCursor,
        hasMore: entry.hasMore,
      },
      isStale: Date.now() >= entry.staleAt,
      cachedAt: entry.cachedAt,
    };
  }, null);
}

export async function setCachedDiscoverFeed(
  platform: string | undefined,
  userId: string | undefined,
  data: DiscoverFeedResponse,
  ttl = CACHE_TTL.DISCOVER_CONTENT,
  viewerUserId?: string,
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const now = Date.now();
    const identityKey = discoverIdentityKey(viewerUserId);
    const key = discoverFeedKey(platform, userId, identityKey);
    const existing = await db.discoverContents.get(key);
    const tombstones = buildTombstones(
      existing,
      data.contents,
      now + ttl + STALE_WINDOW
    );
    const entry: DiscoverContentEntry = {
      key,
      identityKey,
      contents: applyTombstones(data.contents, tombstones),
      tombstones,
      nextCursor: data.nextCursor,
      hasMore: data.hasMore,
      cachedAt: now,
      staleAt: now + ttl,
      expiresAt: now + ttl + STALE_WINDOW,
    };
    await db.discoverContents.put(entry);
  }, undefined);
}


