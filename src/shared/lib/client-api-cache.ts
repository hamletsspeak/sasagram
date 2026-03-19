"use client";

const MAX_CACHE_ENTRIES = 50;

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

type FetchCacheOptions = {
  ttlMs: number;
  forceRefresh?: boolean;
  init?: RequestInit;
};

declare global {
  interface Window {
    __sasagramApiCache?: Map<string, CacheEntry>;
    __sasagramApiPending?: Map<string, Promise<unknown>>;
  }
}

function evictExpiredEntries(map: Map<string, CacheEntry>) {
  const now = Date.now();
  for (const [key, entry] of map) {
    if (entry.expiresAt <= now) map.delete(key);
  }

  if (map.size > MAX_CACHE_ENTRIES) {
    const oldest = [...map.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toRemove = oldest.length - MAX_CACHE_ENTRIES;
    for (let i = 0; i < toRemove; i++) map.delete(oldest[i][0]);
  }
}

function cacheMap(): Map<string, CacheEntry> {
  if (!window.__sasagramApiCache) {
    window.__sasagramApiCache = new Map<string, CacheEntry>();
  }

  return window.__sasagramApiCache;
}

function pendingMap(): Map<string, Promise<unknown>> {
  if (!window.__sasagramApiPending) {
    window.__sasagramApiPending = new Map<string, Promise<unknown>>();
  }

  return window.__sasagramApiPending;
}

export async function fetchJsonWithCache<T>(
  cacheKey: string,
  url: string,
  options: FetchCacheOptions
): Promise<T> {
  const now = Date.now();
  const cached = cacheMap().get(cacheKey);

  if (!options.forceRefresh && cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const pending = pendingMap().get(cacheKey);
  if (pending) {
    return (await pending) as T;
  }

  const requestPromise = fetch(url, {
    cache: "no-store",
    ...options.init,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Request failed for ${cacheKey}: ${response.status}`);
      }

      const json = (await response.json()) as T;
      const map = cacheMap();
      map.set(cacheKey, { data: json, expiresAt: Date.now() + options.ttlMs });
      evictExpiredEntries(map);
      return json;
    })
    .finally(() => {
      pendingMap().delete(cacheKey);
    });

  pendingMap().set(cacheKey, requestPromise);
  return (await requestPromise) as T;
}

export function clearClientApiCache() {
  if (typeof window === "undefined") {
    return;
  }

  cacheMap().clear();
  pendingMap().clear();
}
