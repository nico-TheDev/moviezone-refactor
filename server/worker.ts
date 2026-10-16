import { createApp } from "./app";
import type { RateLimitBindings } from "./middleware/rate-limit";

type Bindings = RateLimitBindings & {
    ASSETS: { fetch: (request: Request) => Promise<Response> };
};

const app = createApp<{ Bindings: Bindings }>();

// run_worker_first only routes /api/* and /health here, so this fallback is rarely hit.
// Static assets and SPA routes are normally served before the Worker runs.
app.all("*", async (c) => {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    return new Response(res.body, res);
});

export default app;
