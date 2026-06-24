type CacheEntry = { body: string; status: number; expiresAt: number };

const store = new Map<string, CacheEntry>();

const CACHEABLE_PREFIXES = ["/genre/", "/discover/", "/trending/", "/movie/popular", "/tv/popular"];

export function getCacheTtlMs(path: string): number {
    if (path.includes("/genre/")) return 60 * 60 * 1000;
    if (path.includes("/discover/") || path.includes("/trending/")) return 5 * 60 * 1000;
    return 0;
}

export function isCacheableGet(method: string, path: string): boolean {
    if (method !== "GET") return false;
    return CACHEABLE_PREFIXES.some((prefix) => path.includes(prefix));
}

export function readCache(key: string): CacheEntry | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
    }
    return entry;
}

export function writeCache(key: string, body: string, status: number, ttlMs: number) {
    if (ttlMs <= 0) return;
    store.set(key, { body, status, expiresAt: Date.now() + ttlMs });
}

export function clearCache() {
    store.clear();
}
