import Dexie, { type Dexie as DexieType, type Table } from "dexie";

export interface DiscoverProfileEntry {
  key: string;
  identityKey: string;
  profile: unknown;
  cachedAt: number;
  staleAt: number;
  expiresAt: number;
}

export interface DiscoverContentEntry {
  key: string;
  identityKey: string;
  contents: unknown[];
  tombstones: Record<string, number>;
  nextCursor: string | null;
  hasMore: boolean;
  cachedAt: number;
  staleAt: number;
  expiresAt: number;
}

interface GaddrCacheDB extends DexieType {
  discoverProfiles: Table<DiscoverProfileEntry, string>;
  discoverContents: Table<DiscoverContentEntry, string>;
}

const DB_NAME = "GaddrCache";
const DB_VERSION = 2;

let _db: GaddrCacheDB | null = null;
let _dbError: Error | null = null;
let _dbOpenPromise: Promise<boolean> | null = null;

function createDb(): GaddrCacheDB {
  const db = new Dexie(DB_NAME) as GaddrCacheDB;

  db.version(1).stores({
    discoverProfiles: "key, cachedAt, expiresAt",
    discoverContents: "key, cachedAt, expiresAt",
  });

  db.version(DB_VERSION)
    .stores({
      discoverProfiles: "key, identityKey, cachedAt, expiresAt",
      discoverContents: "key, identityKey, cachedAt, expiresAt",
    })
    .upgrade(async (transaction) => {
      // Version 1 keys were not partitioned by the authenticated viewer. They
      // cannot be assigned safely during migration, so discard them.
      await Promise.all([
        transaction.table("discoverProfiles").clear(),
        transaction.table("discoverContents").clear(),
      ]);
    });

  return db;
}

export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.indexedDB;
  } catch {
    return false;
  }
}

export async function ensureDbOpen(): Promise<boolean> {
  if (!isIndexedDBAvailable()) return false;
  if (_dbError) return false;
  if (_dbOpenPromise) return _dbOpenPromise;

  _dbOpenPromise = (async () => {
    try {
      _db = createDb();
      await _db.open();
      await purgeExpiredCaches(_db);
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (
        error.name === "QuotaExceededError" ||
        (error as DOMException).code === 22
      ) {
        try {
          await clearAllCaches();
          return true;
        } catch {
          return false;
        }
      }

      if (
        error.name === "InvalidStateError" ||
        /corrupt/i.test(error.message)
      ) {
        try {
          await Dexie.delete(DB_NAME);
          _db = null;
          _dbOpenPromise = null;
          _db = createDb();
          await _db.open();
          return true;
        } catch {
          return false;
        }
      }

      _dbError = error;
      return false;
    }
  })();

  return _dbOpenPromise;
}

export function getDb(): GaddrCacheDB | null {
  if (_dbError) return null;
  return _db;
}

async function purgeExpiredCaches(db: GaddrCacheDB): Promise<void> {
  const now = Date.now();
  await Promise.all([
    db.discoverProfiles.where("expiresAt").belowOrEqual(now).delete(),
    db.discoverContents.where("expiresAt").belowOrEqual(now).delete(),
  ]);
}

export async function clearAllCaches(): Promise<void> {
  const db = getDb();
  if (!db) {
    if (!isIndexedDBAvailable()) return;
    try {
      await Dexie.delete(DB_NAME);
      _db = null;
      _dbOpenPromise = null;
      _dbError = null;
    } catch {}
    return;
  }
  try {
    await Promise.all([
      db.discoverProfiles.clear(),
      db.discoverContents.clear(),
    ]);
  } catch {}
}

export async function clearIdentityCaches(identityKey: string): Promise<void> {
  const ready = await ensureDbOpen();
  if (!ready) return;
  const db = getDb();
  if (!db) return;

  await Promise.all([
    db.discoverProfiles.where("identityKey").equals(identityKey).delete(),
    db.discoverContents.where("identityKey").equals(identityKey).delete(),
  ]);
}

export async function closeDb(): Promise<void> {
  try {
    if (_db) {
      _db.close();
    }
  } catch {
  } finally {
    _db = null;
    _dbOpenPromise = null;
    _dbError = null;
  }
}
