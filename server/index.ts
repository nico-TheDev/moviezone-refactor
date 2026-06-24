import "./load-env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuthRoutes } from "./auth-routes";
import { getServerEnv } from "./env";
import { rateLimit } from "./middleware/rate-limit";
import { securityHeaders } from "./middleware/security-headers";
import { proxyTmdbRequest } from "./tmdb-proxy";

const app = new Hono();

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
    const body =
        method === "POST" || method === "DELETE" ? await c.req.text() : undefined;
    return proxyTmdbRequest(c, method, path, body || undefined);
});

app.get("/health", (c) => c.json({ ok: true }));

const { clientDir, port } = getServerEnv();
const staticRoot = join(process.cwd(), clientDir);

app.use("/assets/*", serveStatic({ root: staticRoot }));
app.use("/icons/*", serveStatic({ root: staticRoot }));
app.use("/img/*", serveStatic({ root: staticRoot }));
app.use("/registerSW.js", serveStatic({ root: staticRoot }));
app.use("/manifest.webmanifest", serveStatic({ root: staticRoot }));
app.use("/sw.js", serveStatic({ root: staticRoot }));
app.use("/workbox-*.js", serveStatic({ root: staticRoot }));

function contentTypeForPath(path: string): string {
    if (path.endsWith(".js")) return "application/javascript";
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".webmanifest")) return "application/manifest+json";
    if (path.endsWith(".json")) return "application/json";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".ico")) return "image/x-icon";
    if (path.endsWith(".svg")) return "image/svg+xml";
    return "text/html";
}

app.get("*", (c) => {
    const path = c.req.path;
    if (path.startsWith("/api/")) {
        return c.json({ message: "Not found" }, 404);
    }
    try {
        const filePath = join(staticRoot, path === "/" ? "index.html" : path);
        const content = readFileSync(filePath);
        return c.body(content, 200, { "content-type": contentTypeForPath(path) });
    } catch {
        const html = readFileSync(join(staticRoot, "index.html"), "utf-8");
        return c.html(html);
    }
});

serve({ fetch: app.fetch, port }, (info) => {
    console.log(`MovieZone BFF listening on http://localhost:${info.port}`);
});
