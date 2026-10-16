# MovieZone

## Stack

- **Language / Runtime**: TypeScript 5 (strict, `verbatimModuleSyntax`), Node 20+ (CI and Docker use 22)
- **Framework**: React 19 + React Router 7 in SPA mode (`ssr: false`), Vite 8
- **Key dependencies**: TanStack Query v5 (server state), Zustand (auth state), Hono BFF on `@hono/node-server`, Tailwind CSS v4, Embla (carousels), `motion` (animation)
- **Testing**: Vitest + Testing Library + MSW, Playwright for E2E
- **Package manager**: npm (`.npmrc` sets `legacy-peer-deps=true`; CI runs `npm ci --legacy-peer-deps`)

## Build approach

Tracer Bullet (prove the whole pattern on one route, then widen it route by route).

## Commands

```bash
# Install
npm install

# Dev server (two processes: run both with dev:all, or each in its own terminal)
npm run dev:all      # both of the below, output prefixed [server] / [web]
npm run dev:server   # BFF on http://localhost:3001
npm run dev          # Vite on http://localhost:5173, proxies /api to the BFF

# Build and run production
npm run build        # outputs to build/client/
npm start            # BFF serves static files + API
npm run deploy       # build, then deploy to Cloudflare Workers (wrangler.jsonc)

# Test and checks
npm test             # Vitest unit and component tests
npm run test:e2e     # Playwright, builds and boots the BFF on port 3001
npm run typecheck    # react-router typegen, then tsc
npm run check        # Biome lint, format and import order check; warnings fail
npm run check:fix    # the same check, applying every safe fix
npm run format       # Biome formatting only
```

## Specs

Stored in `docs/specs/` as `docs/specs/NNNN-title.md`. [0001](docs/specs/0001-coding-standards-tooling/index.md) governs the enforced lint, format and commit standard.

## Rules

- The `@/` alias maps to `app/`. Prefer it over long relative paths.
- Four space indentation, double quotes, semicolons, trailing commas, 100 character line width. Biome enforces this: run `npm run check:fix` rather than matching the surrounding file by hand.
- Data flows one way: route calls a hook or `useQuery` with a `queryOptions` factory from `app/queries/`, which calls `app/api/`, which calls `tmdbFetch` in `app/api/client.ts`. Keep routes thin and put `queryKey`, `queryFn`, and `select` shaping in the query module.
- The browser never calls TMDB directly. Every TMDB request goes through the BFF, and TMDB credentials must never carry a `VITE_` prefix. CI fails the build if `TMDB_BEARER_TOKEN` appears in the client bundle.
- Export style: routes use `export function meta` plus `export default function <Page>`; components, hooks, and utils use named exports.
- Tailwind utility classes are written inline. Use `cn()` from `app/utils/css-helpers.ts` when classes are conditional. There is no component library.
- API failures throw `ApiError` from `app/api/client.ts`. Render page level failures with `ErrorState` and partial failures inside a page with `SectionError`, both of which read copy from `getErrorMessage` in `app/utils/error-helpers.ts`.
- Types come from `app/types/tmdb.ts`. `app/types/tmdb.generated.ts` is generated from the TMDB OpenAPI spec; never edit it by hand.
- Route modules import their generated types from `./+types/<route>`. Those live in `.react-router/types/` (gitignored) and come from `npm run typecheck` or `npm run dev`, so run typecheck after adding a route.

## Agent skills

Declined: Agent Skills and MCP discovery for this stack (declined during /audit, do not offer again in /audit or /architect).

## Context files

- [app/AGENTS.md](app/AGENTS.md): client app, the route to query to API to client layering, styling, and component conventions
- [server/AGENTS.md](server/AGENTS.md): Hono BFF, TMDB proxy, auth cookies, caching, and rate limiting
- [tests/AGENTS.md](tests/AGENTS.md): Vitest and MSW unit and component tests, plus the Playwright E2E setup

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
