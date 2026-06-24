# MovieZone

A movie and TV discovery web app powered by the [TMDB API](https://www.themoviedb.org/documentation/api). Browse trending titles, search, view details, manage favorites and watchlists, and rate content — with optional TMDB OAuth login or guest sessions.

## Tech Stack

| Layer | Technology |
|---|---|
| **UI** | React 19, React Router 7 (SPA mode) |
| **Styling** | Tailwind CSS v4, `clsx` + `tailwind-merge` |
| **Server state** | TanStack Query v5 |
| **Client state** | Zustand (auth persistence) |
| **BFF / API** | Hono on Node (`@hono/node-server`) |
| **Build** | Vite 8, TypeScript 5 |
| **Carousels** | Embla Carousel |
| **Animations** | Motion |
| **Icons** | Lucide React |
| **PWA** | `vite-plugin-pwa` + Workbox |
| **Unit / component tests** | Vitest, Testing Library, MSW |
| **E2E tests** | Playwright |
| **CI** | GitHub Actions |

## Architecture

MovieZone uses a **client + BFF (Backend-for-Frontend)** split. The browser never talks to TMDB directly — all API credentials stay on the server.

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Routes   │→ │ TanStack     │→ │ API modules           │  │
│  │          │  │ Query        │  │ (media, search, auth) │  │
│  └──────────┘  └──────────────┘  └───────────┬───────────┘  │
│  ┌──────────┐                                │ fetch       │
│  │ Zustand  │  auth mode / account            ▼             │
│  │ auth     │                      /api/tmdb/*  /api/auth/*  │
│  └──────────┘                                │             │
│  ┌──────────┐  Service Worker (PWA cache)    │             │
│  └──────────┘                                │             │
└──────────────────────────────────────────────┼─────────────┘
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Hono BFF (`server/`)                                       │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │ Rate limit   │→ │ TMDB proxy │→ │ TMDB API v3         │   │
│  │ Security hdrs│  │ + cache    │  │ (Bearer + API key)  │   │
│  └──────────────┘  └────────────┘  └─────────────────────┘   │
│  ┌──────────────┐                                            │
│  │ Auth routes  │  OAuth token exchange, httpOnly cookies    │
│  └──────────────┘                                            │
│  ┌──────────────┐                                            │
│  │ Static files │  Serves `build/client` in production       │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### Rendering model

React Router is configured with **`ssr: false`** — the app ships as a single-page application. Routes are file-based (`app/routes.ts`), wrapped in a shared `AppShell` layout (nav, footer, toast provider).

### Data flow

1. **Routes** render UI and call `useQuery` with shared query definitions from `app/queries/`.
2. **Query modules** define cache keys, `queryFn`, and `select` transforms (e.g. slicing cast to 12 members).
3. **API modules** (`app/api/`) map domain operations to BFF paths.
4. **`tmdbFetch` / `authBffFetch`** (`app/api/client.ts`) perform typed `fetch` calls with credentials and normalized `ApiError` handling.
5. The **BFF** proxies `/api/tmdb/*` to TMDB, injects session cookies into account-scoped paths, and caches safe GET responses in memory.

### Authentication

Sessions are stored in **httpOnly cookies** (`mz_session` for logged-in users, `mz_guest` for guests) set by the BFF. The client tracks auth mode in a persisted Zustand store for UI gating.

| Flow | Endpoint | Result |
|---|---|---|
| TMDB OAuth | `GET /api/auth/request-token` → TMDB approve → `POST /api/auth/session` | User session cookie + account info |
| Guest browse | `POST /api/auth/guest` | Guest session cookie |
| Logout | `DELETE /api/auth/session` | Clears cookies, invalidates TMDB session |

Guest sessions can rate content; favorites and watchlist require a full TMDB login.

### BFF responsibilities

- **TMDB proxy** — path sanitization, Bearer token injection, session ID injection for account endpoints
- **In-memory cache** — TTL-based caching for genres, discover, trending, and popular lists
- **Rate limiting** — per-IP and per-session limits; Upstash Redis in production, in-memory fallback locally
- **Security headers** — CSP and related headers via middleware
- **Static hosting** — serves the Vite build with SPA fallback (`index.html` for unknown paths)

### PWA

The service worker (registered in `app/lib/registerPwa.ts`) caches app shell assets, TMDB API responses (network-first), and TMDB images (cache-first). Manifest and icons live under `public/icons/`.

## Project Structure

```
app/
├── api/           # BFF fetch wrappers per domain (media, search, auth, …)
├── components/    # UI components (layout, carousels, modals, skeletons)
├── constants/     # API URLs, list categories
├── hooks/         # Custom hooks (media, TV, infinite scroll, auth callback)
├── lib/           # QueryClient, PWA registration
├── queries/       # TanStack Query keys + queryOptions factories
├── routes/        # Page components (home, media details, search, …)
├── stores/        # Zustand stores (auth)
├── types/         # TMDB TypeScript types
└── utils/         # Pure helpers (errors, genres, video, CSS)

server/
├── index.ts       # Hono app entry — routes, static, listen
├── auth-routes.ts # TMDB OAuth + guest session handlers
├── tmdb-proxy.ts  # TMDB request proxy + session injection
├── cache.ts       # In-memory response cache
├── env.ts         # Server environment config
└── middleware/    # Rate limiting, security headers

tests/             # Vitest unit + component tests
e2e/               # Playwright smoke tests
```

Path alias `@/` maps to `app/` (configured in `tsconfig.json` and Vite).

## Routes

| Path | Page |
|---|---|
| `/` | Home — featured hero + carousels |
| `/media/:type/:id` | Movie or TV detail |
| `/media/tv/:showId/season/:seasonNumber` | Season episodes |
| `/list/:mediaType/:category` | Paginated lists (popular, trending, …) |
| `/:type/genre/:slug/:id` | Genre browse |
| `/search/:query` | Search results |
| `/person/:personId` | Person detail |
| `/login` | TMDB OAuth / guest entry |
| `/login/callback` | OAuth redirect handler |
| `/profile` | User profile (requires session) |

See [FEATURES.md](FEATURES.md) for the full feature list and [REFACTOR.md](REFACTOR.md) for intentional differences from the legacy app.

## Getting Started

### Prerequisites

- Node.js 20+
- TMDB API credentials ([request access](https://www.themoviedb.org/settings/api))

### Environment

Copy `.env.example` to `.env` and fill in your TMDB credentials:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `TMDB_BEARER_TOKEN` | Yes | TMDB v4 read access token (server-only) |
| `TMDB_API_KEY` | Yes | TMDB v3 API key (used for OAuth token exchange) |
| `PORT` | No | BFF port (default `3001`) |
| `VITE_APP_URL` | No | Public URL for TMDB OAuth redirect |
| `UPSTASH_REDIS_REST_URL` | No | Distributed rate limiting (production) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Distributed rate limiting (production) |

> TMDB tokens must **never** be prefixed with `VITE_` — they belong on the server only. CI verifies the client bundle does not contain `TMDB_BEARER_TOKEN`.

### Development

The frontend dev server and BFF run as two processes. In separate terminals:

```bash
npm install
npm run dev:server   # BFF on http://localhost:3001
npm run dev          # Vite + React Router on http://localhost:5173
```

Vite proxies `/api/*` requests to the BFF (`vite.config.ts`).

### Production build

```bash
npm run build        # Outputs to build/client/
npm start            # Serves static files + BFF on PORT (default 3001)
```

### Docker

```bash
docker build -t moviezone .
docker run -p 3001:3001 \
  -e TMDB_BEARER_TOKEN=... \
  -e TMDB_API_KEY=... \
  moviezone
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Frontend dev server with HMR |
| `npm run dev:server` | BFF dev server |
| `npm run build` | Production client build |
| `npm start` | Production BFF + static hosting |
| `npm run typecheck` | React Router typegen + `tsc` |
| `npm test` | Vitest unit/component tests |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run analyze` | Bundle size report (`dist/stats.html`) |
| `npm run generate:icons` | Regenerate PWA icons from source |

## Testing

**Unit / component** — Vitest with jsdom, Testing Library, and MSW handlers in `tests/mocks/`. Query retry behavior and API error handling are covered alongside component tests.

**E2E** — Playwright smoke specs in `e2e/` run against a production build with the BFF. CI runs typecheck, unit tests, build (including PWA artifact verification), then E2E with secrets for TMDB credentials.

## Key Design Decisions

- **SPA over SSR** — simpler deployment; data is fetched client-side via TanStack Query with 5-minute stale time.
- **BFF over direct TMDB calls** — keeps API keys off the client, enables server-side caching and rate limiting, and manages sessions via httpOnly cookies.
- **Query options factories** — `mediaQueries.details("movie", id)` centralizes keys, fetch logic, and response shaping so routes stay thin.
- **Section-level errors** — list pages use `SectionError` for partial failures; the root `ErrorBoundary` handles catastrophic route errors.
- **Infinite scroll** — list, genre, and search pages load more content on scroll instead of numbered pagination.
