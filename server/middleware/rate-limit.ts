import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Context, MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getServerEnv } from "../env";

type Limiter = {
    consume: (key: string) => Promise<{ allowed: boolean; retryAfterSec: number }>;
};

type LimiterName = "global" | "search" | "auth" | "session";

/** Cloudflare Workers Rate Limiting binding, declared under `ratelimits` in wrangler.jsonc. */
export type RateLimitBinding = {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

export type RateLimitBindings = {
    RL_GLOBAL?: RateLimitBinding;
    RL_SEARCH?: RateLimitBinding;
    RL_AUTH?: RateLimitBinding;
    RL_SESSION?: RateLimitBinding;
};

/**
 * Limits used when the Worker bindings are absent (Node, Docker, tests). The Worker
 * equivalents live in wrangler.jsonc, where the period can only be 10 or 60 seconds.
 */
const FALLBACK_LIMITS: Record<LimiterName, { prefix: string; limit: number; windowSec: number }> = {
    global: { prefix: "mz:ip:global", limit: 100, windowSec: 60 },
    search: { prefix: "mz:ip:search", limit: 20, windowSec: 60 },
    auth: { prefix: "mz:ip:auth", limit: 10, windowSec: 300 },
    session: { prefix: "mz:session:api", limit: 200, windowSec: 60 },
};

const BINDING_NAMES: Record<LimiterName, keyof RateLimitBindings> = {
    global: "RL_GLOBAL",
    search: "RL_SEARCH",
    auth: "RL_AUTH",
    session: "RL_SESSION",
};

/** Every Worker binding uses a 60 second period, so a blocked client waits at most that long. */
const BINDING_PERIOD_SEC = 60;

function createUpstashLimiter(prefix: string, limit: number, windowSec: number): Limiter | null {
    const { upstashUrl, upstashToken } = getServerEnv();
    if (!upstashUrl || !upstashToken) return null;

    const ratelimit = new Ratelimit({
        redis: new Redis({ url: upstashUrl, token: upstashToken }),
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix,
    });

    return {
        consume: async (key) => {
            const result = await ratelimit.limit(key);
            return {
                allowed: result.success,
                retryAfterSec: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
            };
        },
    };
}

function createMemoryLimiter(limit: number, windowSec: number): Limiter {
    const limiter = new RateLimiterMemory({ points: limit, duration: windowSec });
    return {
        consume: async (key) => {
            try {
                await limiter.consume(key);
                return { allowed: true, retryAfterSec: 0 };
            } catch (rej: unknown) {
                const ms =
                    typeof rej === "object" && rej !== null && "msBeforeNext" in rej
                        ? Number((rej as { msBeforeNext: number }).msBeforeNext)
                        : windowSec * 1000;
                return {
                    allowed: false,
                    retryAfterSec: Math.max(1, Math.ceil(ms / 1000)),
                };
            }
        },
    };
}

function createBindingLimiter(binding: RateLimitBinding): Limiter {
    return {
        consume: async (key) => {
            const { success } = await binding.limit({ key });
            return { allowed: success, retryAfterSec: success ? 0 : BINDING_PERIOD_SEC };
        },
    };
}

// Built on first use so the Worker, which uses its bindings, never reads Upstash config.
const fallbackLimiters = new Map<LimiterName, Limiter>();

function getLimiter(name: LimiterName, bindings: RateLimitBindings | undefined): Limiter {
    const binding = bindings?.[BINDING_NAMES[name]];
    if (binding && typeof binding.limit === "function") return createBindingLimiter(binding);

    let limiter = fallbackLimiters.get(name);
    if (!limiter) {
        const { prefix, limit, windowSec } = FALLBACK_LIMITS[name];
        limiter =
            createUpstashLimiter(prefix, limit, windowSec) ?? createMemoryLimiter(limit, windowSec);
        fallbackLimiters.set(name, limiter);
    }
    return limiter;
}

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
    return (
        c.req.header("cf-connecting-ip") ??
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
        c.req.header("x-real-ip") ??
        "unknown"
    );
}

function isSearchPath(path: string): boolean {
    return path.includes("/search/") || path.includes("query=");
}

/** Session ids are credentials, so only a hash of one is used as a limiter key. */
async function hashSessionId(sessionId: string): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sessionId));
    return Array.from(new Uint8Array(digest).slice(0, 16), (b) =>
        b.toString(16).padStart(2, "0"),
    ).join("");
}

export const rateLimit: MiddlewareHandler = async (c: Context, next) => {
    const path = c.req.path;
    if (!path.startsWith("/api/")) {
        await next();
        return;
    }

    const bindings = c.env as RateLimitBindings | undefined;
    const ip = getClientIp(c);
    const sessionId = getCookie(c, "mz_session");

    // Per IP limits ignore cookies, so sending a made up cookie never earns a second bucket.
    const checks: Array<{ limiter: Limiter; key: string }> = [
        { limiter: getLimiter("global", bindings), key: ip },
    ];
    if (path.startsWith("/api/auth")) {
        checks.push({ limiter: getLimiter("auth", bindings), key: ip });
    } else if (path.startsWith("/api/tmdb") && isSearchPath(path)) {
        checks.push({ limiter: getLimiter("search", bindings), key: ip });
    } else if (sessionId) {
        checks.push({
            limiter: getLimiter("session", bindings),
            key: await hashSessionId(sessionId),
        });
    }

    for (const { limiter, key } of checks) {
        const result = await limiter.consume(key);
        if (!result.allowed) {
            return c.json({ message: "Too many requests", retryAfter: result.retryAfterSec }, 429, {
                "Retry-After": String(result.retryAfterSec),
            });
        }
    }

    await next();
};
