# server

## Overview

The BFF (backend for frontend) for MovieZone: a Hono app served by `@hono/node-server` locally and in Docker, and as a Cloudflare Worker in production. It keeps TMDB credentials off the client, proxies every TMDB call, exchanges OAuth tokens for httpOnly session cookies, caches safe reads, rate limits, and serves the built client with an SPA fallback.

## Key files

| File | Owns |
|---|---|
| `server/app.ts` | `createApp()`: middleware order, route mounting, and the JSON `404` for unknown `/api/*`. Shared by both entries. |
| `server/index.ts` | Node entry: static file serving from disk, SPA fallback, `listen`. |
| `server/worker.ts` | Cloudflare Worker entry: serves `build/client` through the `ASSETS` binding. |
| `wrangler.jsonc` | Worker config: `nodejs_compat`, static assets with SPA fallback, `NODE_ENV` var. |
| `server/tmdb-proxy.ts` | `/api/tmdb/*` handling: path sanitizing, session injection, upstream fetch, cache read and write. |
| `server/auth-routes.ts` | `/api/auth/*`: request token, session exchange, guest session, logout, account lookup. |
| `server/cache.ts` | TTL cache held in memory, and the rules for which paths are cacheable. |
| `server/env.ts` | `getServerEnv()` and `assertServerEnv()`. Every secret is read here. |
| `server/load-env.ts` | Small hand written `.env` loader, imported first by `index.ts`. |
| `server/middleware/rate-limit.ts` | Per IP and per session limits, Upstash in production, memory fallback elsewhere. |
| `server/middleware/security-headers.ts` | CSP and the other security headers. |

## Commands

```bash
npm run dev:server   # BFF on :3001 with tsx watch style reload via --import tsx
npm start            # production mode, serves build/client and the API
npm run preview      # build, then run the Worker locally with wrangler dev
npm run deploy       # build, then wrangler deploy to Cloudflare
npm test             # Vitest also covers server units: tmdb-proxy, rate limit
```

## Conventions

- Start the server from the repository root. `clientDir` is resolved with `process.cwd()`, so running from elsewhere breaks static serving.
- The server is never bundled or compiled to JavaScript. Docker copies `server/` as TypeScript and runs it with `npx tsx`. Keep server code runnable by `tsx` on Node, and do not rely on the Vite build for anything under `server/`. The one exception is the Worker, which Wrangler bundles from `server/worker.ts`.
- Code reached from `server/app.ts` runs on both Node and Workers, so keep it free of Node only APIs such as `node:fs` and `node:path`. Runtime specific code belongs in `server/index.ts` or `server/worker.ts`.
- Read secrets through `getServerEnv()` or `assertServerEnv()`, never `process.env` at the call site.
- Middleware is registered on `*` in this order: `securityHeaders`, `cors`, `rateLimit`. Rate limiting only applies to paths starting with `/api/`.
- New TMDB upstream calls belong in `tmdb-proxy.ts`, not in a new fetch. Route handlers stay small and return `c.json(...)`.
- Errors are returned as JSON (`{ message }` plus a status) rather than thrown, except for missing configuration, which throws.

## Gotchas

- Session cookies are `mz_session` (logged in) and `mz_guest` (guest), httpOnly, `sameSite: "Lax"`, `secure` only when `NODE_ENV=production`, 30 day max age. Logging in deletes `mz_guest`.
- `injectSessionPath` appends `session_id` or `guest_session_id` only for account, rating, favorite, watchlist and guest session paths, and rewrites `/guest_session/rated` to `/guest_session/<id>/rated`. Changing that regex changes what every authenticated request does.
- The cache is a plain `Map` in process memory. It is per process, so it is not shared across machines or serverless instances, and it resets on every deploy. Only GET requests on `/genre/`, `/discover/`, `/trending/`, `/movie/popular` and `/tv/popular` are cached, at 1 hour for genres and 5 minutes otherwise. Responses carry `x-cache: HIT` or `MISS`.
- `sanitizeTmdbPath` rejects paths that do not start with `/`, or that contain `..` or `//`. Keep that check before anything else touches the path.
- The memory rate limiter is per process, so it does not protect a multi instance deployment. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production. Limits: 100 requests per minute per IP globally, 20 per minute on search, 10 per 5 minutes on auth, 200 per minute per session.
- Rate limited responses are `429` with a `Retry-After` header. The client turns that into `ApiError.retryAfter` and the UI shows a wait message, so keep the header.
- `getServerEnv()` still falls back to `VITE_TMDB_BEARER_TOKEN` and `VITE_TMDB_API_KEY` for legacy compatibility. Do not put TMDB secrets under a `VITE_` name in `.env`: Vite inlines that prefix into the client bundle, and CI greps the built bundle for `TMDB_BEARER_TOKEN` and fails the build.
- On Node, the SPA fallback reads `index.html` with `readFileSync` for unknown paths, which is what makes client side routes work in production. Requests under `/api/` return JSON `404` instead.
- On Workers, `nodejs_compat` puts vars and secrets on `process.env`, so `getServerEnv()` works unchanged. Set `TMDB_BEARER_TOKEN`, `TMDB_API_KEY` and the Upstash pair as Worker secrets (dashboard or `wrangler secret put`), never in `wrangler.jsonc`. The Worker never reads `.env`.
- `run_worker_first: true` sends every request, static files included, through the Worker so the security headers apply. The Worker rebuilds each `ASSETS` response because its headers are immutable.
- CSP allows `frame-src https://www.youtube-nocookie.com` only, which is why trailers use the nocookie embed.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
