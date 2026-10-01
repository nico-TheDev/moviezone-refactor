# app

## Overview

The client side of MovieZone: a React 19 single page app served by React Router 7 with `ssr: false`. It holds every route, the TanStack Query layer that talks to the BFF, the Zustand auth store, and the Tailwind styled components. Nothing here talks to TMDB directly.

## Key files

| File | Owns |
|---|---|
| `app/routes.ts` | The explicit route table. New pages must be registered here, file naming alone does nothing. |
| `app/root.tsx` | HTML shell, `QueryClientProvider`, PWA registration, root `ErrorBoundary`. |
| `app/components/layout/AppShell.tsx` | Shared layout (nav, footer, toast provider) wrapping every route, plus the OAuth callback handler. |
| `app/api/client.ts` | `tmdbFetch`, `authBffFetch`, and the `ApiError` class. The only place `fetch` is called. |
| `app/api/*.api.ts` | One module per domain (media, search, account, auth, person) mapping operations to BFF paths. |
| `app/queries/*.queries.ts` | Query key factories and `queryOptions` factories, including all `select` shaping. |
| `app/hooks/*.hooks.ts` | Thin `useQuery` wrappers plus `useInfiniteScroll` and `useTmdbAuthCallback`. |
| `app/stores/auth.ts` | Persisted Zustand auth store (UI gating only). |
| `app/lib/queryClient.ts` | The single `QueryClient` and its defaults. |
| `app/constants/api.ts` | BFF base paths, TMDB image size URLs, and `getAppUrl()`. |
| `app/app.css` | Tailwind v4 import and the `@theme` design tokens. |
| `app/types/tmdb.ts` | Hand written domain types and generics such as `MediaType`. |
| `app/utils/` | Pure helpers: errors, genres, video picking, gravatar, CSS. |

## Commands

```bash
npm run dev        # Vite dev server on :5173, proxies /api to the BFF on :3001
npm test           # Vitest, covers app/**/*.test.tsx as well as tests/
npm run analyze    # bundle size report at dist/stats.html
```

## Conventions

- Adding a page means three things: a module in `app/routes/`, a line in `app/routes.ts`, and a `meta` export next to the default exported component.
- Query keys are never written by hand in a route. Extend the matching `*Keys` factory and add a `queryOptions` factory beside it.
- `select` is where response shaping lives: cast is sliced to 12, reviews to 5, recommendations to 12, logos to 10. Routes receive already shaped data.
- Components take data and flags as props and stay presentational. Loading and error states are passed in, usually as `isLoading` / `isError` / `onRetry`.
- Skeletons are separate components named `<Thing>Skeleton` (see `MediaCarouselSkeleton`, `MediaDetailsSkeleton`, `HeroFeaturedSkeleton`).
- Two media types are threaded through almost everything as `MediaType` (`"movie" | "tv"`). Prefer the generic helpers in `app/api/media.api.ts` over branching on the string.
- Animation uses `motion` with shared variants from `app/lib/motion.ts`, wrapped in the `app/components/ui/Animated*` components.

## Gotchas

- The auth store is persisted to localStorage under `moviezone-auth`, but the real session is an httpOnly cookie. The store only says what the UI should show, so a stale `mode: "user"` can outlive the cookie. Trust the BFF response, not the store, when it matters.
- A guest session can rate content, but favorites and watchlist require a full TMDB login. Actions attempted without a session surface a toast with a login link rather than redirecting.
- Global query defaults are a 5 minute `staleTime`, one retry, no retry on 429, and `refetchOnWindowFocus: false`. Genre queries override `staleTime` to `Infinity`.
- Playwright runs against a production build on port 3001, so the Vite dev proxy is not in play there.
- There is no `tailwind.config.js`. Design tokens live in the `@theme` block of `app/app.css` and become utilities such as `text-primary` and `bg-primary-hover`. Dark mode follows `prefers-color-scheme`, not a class.
- `app/types/tmdb.generated.ts` is machine generated from the TMDB OpenAPI spec. Read it, never edit it.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
