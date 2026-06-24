import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RateLimiterMemory } from "rate-limiter-flexible";
import type { MiddlewareHandler } from "hono";
import { getServerEnv } from "../env";

type Limiter = {
    consume: (key: string) => Promise<{ allowed: boolean; retryAfterSec: number }>;
};

function createUpstashLimiter(
    prefix: string,
    limit: number,
    windowSec: number,
): Limiter | null {
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

function pickLimiter(prefix: string, limit: number, windowSec: number): Limiter {
    return createUpstashLimiter(prefix, limit, windowSec) ?? createMemoryLimiter(limit, windowSec);
}

const globalLimiter = pickLimiter("mz:ip:global", 100, 60);
const searchLimiter = pickLimiter("mz:ip:search", 20, 60);
const authLimiter = pickLimiter("mz:ip:auth", 10, 300);
const sessionLimiter = pickLimiter("mz:session:api", 200, 60);

function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
    return (
        c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
        c.req.header("x-real-ip") ??
        "unknown"
    );
}

function isSearchPath(path: string): boolean {
    return path.includes("/search/") || path.includes("query=");
}

export const rateLimit: MiddlewareHandler = async (c, next) => {
    const path = c.req.path;
    if (!path.startsWith("/api/")) {
        await next();
        return;
    }

    const ip = getClientIp(c);
    const sessionKey = c.req.header("cookie")?.includes("mz_session=") ? "session" : "anon";

    const checks: Limiter[] = [globalLimiter];
    if (path.startsWith("/api/auth")) {
        checks.push(authLimiter);
    } else if (path.startsWith("/api/tmdb") && isSearchPath(path)) {
        checks.push(searchLimiter);
    } else if (sessionKey === "session") {
        checks.push(sessionLimiter);
    }

    for (const limiter of checks) {
        const key = `${ip}:${sessionKey}`;
        const result = await limiter.consume(key);
        if (!result.allowed) {
            return c.json(
                { message: "Too many requests", retryAfter: result.retryAfterSec },
                429,
                { "Retry-After": String(result.retryAfterSec) },
            );
        }
    }

    await next();
};
