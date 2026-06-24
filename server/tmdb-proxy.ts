import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { assertServerEnv } from "./env";
import { getCacheTtlMs, isCacheableGet, readCache, writeCache } from "./cache";

const TMDB_BASE = "https://api.themoviedb.org/3";

const SESSION_PATH_RE =
    /\/account|account_states|\/rating(\?|$)|\/favorite|\/watchlist|\/guest_session/;

export function injectSessionPath(path: string, c: Context): string {
    const userSession = getCookie(c, "mz_session");
    const guestSession = getCookie(c, "mz_guest");
    const sessionId = userSession ?? guestSession;

    if (!sessionId) return path;

    let resolved = path;

    if (guestSession && resolved.startsWith("/guest_session/rated")) {
        resolved = resolved.replace("/guest_session/rated", `/guest_session/${guestSession}/rated`);
    } else if (guestSession && resolved.startsWith("/guest_session/") && !resolved.includes(guestSession)) {
        resolved = resolved.replace("/guest_session/", `/guest_session/${guestSession}/`);
    }

    if (!SESSION_PATH_RE.test(resolved)) return resolved;
    if (resolved.includes("session_id=") || resolved.includes("guest_session_id=")) return resolved;

    const separator = resolved.includes("?") ? "&" : "?";
    if (guestSession && !userSession) {
        return `${resolved}${separator}guest_session_id=${encodeURIComponent(guestSession)}`;
    }
    return `${resolved}${separator}session_id=${encodeURIComponent(sessionId)}`;
}

export function sanitizeTmdbPath(rawPath: string): string | null {
    const [pathname, ...queryParts] = rawPath.split("?");
    const search = queryParts.length > 0 ? `?${queryParts.join("?")}` : "";

    if (!pathname.startsWith("/")) return null;
    if (pathname.includes("..")) return null;
    if (pathname.includes("//")) return null;

    return `${pathname}${search}`;
}

export async function proxyTmdbRequest(
    c: Context,
    method: string,
    rawPath: string,
    body?: string,
): Promise<Response> {
    const path = sanitizeTmdbPath(rawPath);
    if (!path) {
        return c.json({ message: "Invalid path" }, 400);
    }

    const resolvedPath = injectSessionPath(path, c);
    const env = assertServerEnv();
    const url = `${TMDB_BASE}${resolvedPath}`;
    const cacheKey = `${method}:${resolvedPath}`;
    const ttl = getCacheTtlMs(resolvedPath);

    if (isCacheableGet(method, resolvedPath)) {
        const cached = readCache(cacheKey);
        if (cached) {
            return new Response(cached.body, {
                status: cached.status,
                headers: { "content-type": "application/json", "x-cache": "HIT" },
            });
        }
    }

    const response = await fetch(url, {
        method,
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${env.tmdbBearer}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body,
    });

    const text = await response.text();

    if (isCacheableGet(method, resolvedPath) && response.ok) {
        writeCache(cacheKey, text, response.status, ttl);
    }

    return new Response(text, {
        status: response.status,
        headers: { "content-type": "application/json", "x-cache": "MISS" },
    });
}
