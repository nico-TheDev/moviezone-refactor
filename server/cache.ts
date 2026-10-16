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

type EdgeCache = {
    match: (request: Request) => Promise<Response | undefined>;
    put: (request: Request, response: Response) => Promise<void>;
};

/**
 * Cloudflare's per data center cache (`caches.default`), shared by every Worker isolate in
 * that location. Undefined on Node. It only stores anything on a custom domain: on
 * workers.dev, `put` is a no-op and every lookup misses.
 */
function getEdgeCache(): EdgeCache | undefined {
    return (globalThis as { caches?: { default?: EdgeCache } }).caches?.default;
}

function edgeCacheRequest(key: string): Request {
    return new Request(`https://edge-cache.moviezone.internal/${encodeURIComponent(key)}`);
}

export async function readEdgeCache(key: string): Promise<CacheEntry | undefined> {
    const cache = getEdgeCache();
    if (!cache) return undefined;
    const response = await cache.match(edgeCacheRequest(key));
    if (!response) return undefined;
    const expiresAt = Number(response.headers.get("x-expires-at"));
    return { body: await response.text(), status: response.status, expiresAt };
}

export async function writeEdgeCache(key: string, body: string, status: number, ttlMs: number) {
    const cache = getEdgeCache();
    if (!cache || ttlMs <= 0) return;
    await cache.put(
        edgeCacheRequest(key),
        new Response(body, {
            status,
            headers: {
                "content-type": "application/json",
                "cache-control": `max-age=${Math.ceil(ttlMs / 1000)}`,
                "x-expires-at": String(Date.now() + ttlMs),
            },
        }),
    );
}
