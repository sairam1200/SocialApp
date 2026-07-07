import Dexie, { type Dexie as DexieType, type Table } from "dexie";

export interface DiscoverProfileEntry {
  key: string;
  profile: unknown;
  cachedAt: number;
  staleAt: number;
  expiresAt: number;
}

export interface DiscoverContentEntry {
  key: string;
  contents: unknown[];
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
const DB_VERSION = 1;

let _db: GaddrCacheDB | null = null;
let _dbError: Error | null = null;
let _dbOpenPromise: Promise<boolean> | null = null;

function createDb(): GaddrCacheDB {
  const db = new Dexie(DB_NAME) as GaddrCacheDB;

  db.version(DB_VERSION).stores({
    discoverProfiles: "key, cachedAt, expiresAt",
    discoverContents: "key, cachedAt, expiresAt",
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
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (
        error.name === "QuotaExceededError" ||
        (error as DOMException).code === 22
      ) {
        console.warn("[DB] Quota exceeded, clearing caches");
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
        console.warn("[DB] Corruption detected, recreating database");
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

      console.warn("[DB] Cannot open IndexedDB:", error.message);
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

async function clearAllCaches(): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await Promise.all([
      db.discoverProfiles.clear(),
      db.discoverContents.clear(),
    ]);
  } catch {}
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
