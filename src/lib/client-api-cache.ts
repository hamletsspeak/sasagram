"use client";

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
      cacheMap().set(cacheKey, { data: json, expiresAt: Date.now() + options.ttlMs });
      return json;
    })
    .finally(() => {
      pendingMap().delete(cacheKey);
    });

  pendingMap().set(cacheKey, requestPromise);
  return (await requestPromise) as T;
}
