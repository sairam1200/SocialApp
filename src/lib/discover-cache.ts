import {
  ensureDbOpen,
  getDb,
  type DiscoverProfileEntry,
  type DiscoverContentEntry,
} from "./db";

export const CACHE_TTL = {
  DISCOVER_PROFILE: 5 * 60 * 1000,
  DISCOVER_CONTENT: 5 * 60 * 1000,
};

export const STALE_WINDOW = 30 * 60 * 1000;

interface CacheResult<T> {
  data: T;
  isStale: boolean;
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

function cacheKey(platform: string, userId: string): string {
  return `${platform}_${userId}`;
}

export async function getCachedProfile(
  platform: string,
  userId: string
): Promise<CacheResult<unknown> | null> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return null;
    const entry = await db.discoverProfiles.get(cacheKey(platform, userId));
    if (!entry) return null;
    return {
      data: entry.profile,
      isStale: Date.now() >= entry.staleAt,
    };
  }, null);
}

export async function setCachedProfile(
  platform: string,
  userId: string,
  profile: unknown,
  ttl = CACHE_TTL.DISCOVER_PROFILE
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const now = Date.now();
    const entry: DiscoverProfileEntry = {
      key: cacheKey(platform, userId),
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
  userId: string
): Promise<CacheResult<{ contents: unknown[]; nextCursor: string | null; hasMore: boolean }> | null> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return null;
    const entry = await db.discoverContents.get(cacheKey(platform, userId));
    if (!entry) return null;
    return {
      data: {
        contents: entry.contents,
        nextCursor: entry.nextCursor,
        hasMore: entry.hasMore,
      },
      isStale: Date.now() >= entry.staleAt,
    };
  }, null);
}

export async function setCachedContent(
  platform: string,
  userId: string,
  contents: unknown[],
  nextCursor: string | null,
  hasMore: boolean,
  ttl = CACHE_TTL.DISCOVER_CONTENT
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const now = Date.now();
    const key = cacheKey(platform, userId);

    const existing = await db.discoverContents.get(key);
    const mergedContents = existing
      ? mergeContents(existing.contents as { id: string }[], contents as { id: string }[])
      : contents;

    const entry: DiscoverContentEntry = {
      key,
      contents: mergedContents,
      nextCursor,
      hasMore,
      cachedAt: now,
      staleAt: now + ttl,
      expiresAt: now + ttl + STALE_WINDOW,
    };
    await db.discoverContents.put(entry);
  }, undefined);
}

function mergeContents(
  existing: { id: string }[],
  incoming: { id: string }[]
): unknown[] {
  const seen = new Set<string>();
  const merged: { id: string }[] = [];

  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  for (const item of existing) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

export async function invalidateDiscoverCache(
  platform: string,
  userId: string
): Promise<void> {
  return withDb(async () => {
    const db = getDb();
    if (!db) return;
    const key = cacheKey(platform, userId);
    await Promise.all([
      db.discoverProfiles.delete(key),
      db.discoverContents.delete(key),
    ]);
  }, undefined);
}


