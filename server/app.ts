import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuthRoutes } from "./auth-routes";
import { rateLimit } from "./middleware/rate-limit";
import { securityHeaders } from "./middleware/security-headers";
import { proxyTmdbRequest } from "./tmdb-proxy";

/**
 * Middleware and API routes shared by the Node server and the Cloudflare Worker.
 * Each entry adds its own static file serving and SPA fallback.
 */
export function createApp<E extends object = object>() {
    const app = new Hono<E>();

    app.use("*", securityHeaders);
    app.use(
        "*",
        cors({
            origin: (origin) => origin ?? "*",
            credentials: true,
        }),
    );
    app.use("*", rateLimit);

    app.route("/api/auth", createAuthRoutes());

    app.all("/api/tmdb/*", async (c) => {
        const { pathname, search } = new URL(c.req.url);
        const path = (pathname.replace(/^\/api\/tmdb/, "") || "/") + search;
        const method = c.req.method;
        const body = method === "POST" || method === "DELETE" ? await c.req.text() : undefined;
        return proxyTmdbRequest(c, method, path, body || undefined);
    });

    app.get("/health", (c) => c.json({ ok: true }));

    app.all("/api/*", (c) => c.json({ message: "Not found" }, 404));

    return app;
}
