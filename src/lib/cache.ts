/**
 * Simple in-memory TTL cache for Supabase fetch results.
 * Prevents redundant parallel/sequential fetches within the same session.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<any>>();

// In-flight promise deduplication — if two callers request the same key
// simultaneously, they share the same promise instead of firing two requests.
const inFlight = new Map<string, Promise<any>>();

const DEFAULT_TTL_MS = 60_000; // 60 seconds

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidate(keyPrefix?: string): void {
  if (!keyPrefix) {
    store.clear();
    inFlight.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) store.delete(key);
  }
}

/**
 * Wraps an async function with cache + in-flight deduplication.
 * If a cached value exists it is returned immediately.
 * If a request is already in-flight for the same key, the same promise is returned.
 * Otherwise the fetcher is called, result is cached, and returned.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = fetcher().then((result) => {
    cacheSet(key, result, ttlMs);
    inFlight.delete(key);
    return result;
  }).catch((err) => {
    inFlight.delete(key);
    throw err;
  });

  inFlight.set(key, promise);
  return promise;
}
