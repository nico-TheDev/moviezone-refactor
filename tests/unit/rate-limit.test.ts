import { Hono } from "hono";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { describe, expect, it } from "vitest";
import { type RateLimitBinding, rateLimit } from "../../server/middleware/rate-limit";

function createTestApp() {
    const app = new Hono();
    app.use("*", rateLimit);
    app.all("*", (c) => c.json({ ok: true }));
    return app;
}

/** A fake Workers binding that allows `limit` calls per key and records every key it sees. */
function fakeBinding(limit: number) {
    const counts = new Map<string, number>();
    const binding: RateLimitBinding = {
        limit: async ({ key }) => {
            const next = (counts.get(key) ?? 0) + 1;
            counts.set(key, next);
            return { success: next <= limit };
        },
    };
    return { binding, counts };
}

function headers(ip: string, cookie?: string): HeadersInit {
    return cookie ? { "cf-connecting-ip": ip, cookie } : { "cf-connecting-ip": ip };
}

describe("rate limiter", () => {
    it("returns 429 behavior after threshold is exceeded", async () => {
        const limiter = new RateLimiterMemory({ points: 2, duration: 60 });

        await limiter.consume("test-ip");
        await limiter.consume("test-ip");

        await expect(limiter.consume("test-ip")).rejects.toMatchObject({
            msBeforeNext: expect.any(Number),
        });
    });
});

describe("rateLimit middleware with Workers bindings", () => {
    it("returns 429 with Retry-After once the binding refuses", async () => {
        const app = createTestApp();
        const env = { RL_GLOBAL: fakeBinding(2).binding };

        expect(
            (await app.request("/api/tmdb/movie/1", { headers: headers("1.1.1.1") }, env)).status,
        ).toBe(200);
        expect(
            (await app.request("/api/tmdb/movie/1", { headers: headers("1.1.1.1") }, env)).status,
        ).toBe(200);
        const blocked = await app.request(
            "/api/tmdb/movie/1",
            { headers: headers("1.1.1.1") },
            env,
        );

        expect(blocked.status).toBe(429);
        expect(blocked.headers.get("Retry-After")).toBe("60");
    });

    it("keys the global limit by IP alone, so a made up session cookie earns no extra bucket", async () => {
        const app = createTestApp();
        const global = fakeBinding(1);
        const env = { RL_GLOBAL: global.binding, RL_SESSION: fakeBinding(100).binding };

        await app.request("/api/tmdb/movie/1", { headers: headers("2.2.2.2") }, env);
        const withCookie = await app.request(
            "/api/tmdb/movie/1",
            { headers: headers("2.2.2.2", "mz_session=fake") },
            env,
        );

        expect(withCookie.status).toBe(429);
        expect([...global.counts.keys()]).toEqual(["2.2.2.2"]);
    });

    it("gives each session its own bucket, keyed by a hash rather than the raw id", async () => {
        const app = createTestApp();
        const session = fakeBinding(1);
        const env = { RL_GLOBAL: fakeBinding(100).binding, RL_SESSION: session.binding };

        const first = await app.request(
            "/api/tmdb/movie/1",
            { headers: headers("3.3.3.3", "mz_session=session-a") },
            env,
        );
        const otherSession = await app.request(
            "/api/tmdb/movie/1",
            { headers: headers("3.3.3.3", "mz_session=session-b") },
            env,
        );
        const repeat = await app.request(
            "/api/tmdb/movie/1",
            { headers: headers("3.3.3.3", "mz_session=session-a") },
            env,
        );

        expect(first.status).toBe(200);
        expect(otherSession.status).toBe(200);
        expect(repeat.status).toBe(429);
        const keys = [...session.counts.keys()];
        expect(keys).toHaveLength(2);
        expect(keys.some((key) => key.includes("session-a"))).toBe(false);
    });

    it("applies the search limit to search paths", async () => {
        const app = createTestApp();
        const env = { RL_GLOBAL: fakeBinding(100).binding, RL_SEARCH: fakeBinding(1).binding };

        await app.request("/api/tmdb/search/movie", { headers: headers("4.4.4.4") }, env);
        const blocked = await app.request(
            "/api/tmdb/search/movie",
            { headers: headers("4.4.4.4") },
            env,
        );

        expect(blocked.status).toBe(429);
    });

    it("leaves non API paths alone", async () => {
        const app = createTestApp();
        const env = { RL_GLOBAL: fakeBinding(0).binding };

        const res = await app.request("/movies", { headers: headers("5.5.5.5") }, env);

        expect(res.status).toBe(200);
    });
});
