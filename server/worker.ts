import { createApp } from "./app";

type Bindings = {
    ASSETS: { fetch: (request: Request) => Promise<Response> };
};

const app = createApp<{ Bindings: Bindings }>();

// Static assets, with Cloudflare's single-page-application handling returning index.html
// for client routes. Re-wrapped so securityHeaders can set headers on the response.
app.all("*", async (c) => {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    return new Response(res.body, res);
});

export default app;
