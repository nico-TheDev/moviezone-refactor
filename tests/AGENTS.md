# tests

## Overview

The test suite for MovieZone. `tests/` holds Vitest unit and component tests plus the shared MSW and render helpers, and `e2e/` holds the Playwright smoke flows that drive a real production build in a browser.

## Key files

| File | Owns |
|---|---|
| `tests/setup.ts` | Vitest global setup: jest-dom matchers, MSW lifecycle, `cleanup`, and the `IntersectionObserver` stub. |
| `tests/mocks/handlers.ts` | Default MSW handlers for the BFF paths the UI calls. Add a handler here when a test touches a new endpoint. |
| `tests/mocks/server.ts` | The MSW node server used by setup. |
| `tests/utils/render.tsx` | `renderWithProviders`, wrapping QueryClient, ToastProvider and a MemoryRouter. |
| `tests/unit/` | Pure logic tests: auth store, client and error helpers, genre and media helpers, video helpers, rate limit, tmdb proxy. |
| `tests/components/` | Component tests through Testing Library. |
| `tests/hooks/` | Hook tests, currently the OAuth callback flow. |
| `e2e/smoke.spec.ts` | Playwright smoke flows across desktop and mobile viewports. |
| `playwright.config.ts` | Three device projects and the webServer that builds and boots the BFF on port 3001. |

## Commands

```bash
npm test             # Vitest, single run
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright, builds first and starts the BFF on :3001
```

## Conventions

- Vitest is configured inside `vite.config.ts`, not a separate config file. It uses jsdom, `tests/setup.ts` as setup file, and includes both `tests/**` and `app/**` for `*.test.*` and `*.spec.*`.
- Render components with `renderWithProviders` from `tests/utils/render.tsx` so the Query, Toast and Router contexts are present.
- Network is mocked with MSW, never by stubbing `fetch` in a test. Unhandled requests fail the test, so extend `tests/mocks/handlers.ts` instead of loosening the setting.
- Unit tests for pure helpers live in `tests/unit/` and assert behavior rather than implementation details. Server modules are tested directly by import, no HTTP server needed.
- E2E specs intercept the network at the browser with `page.route("**/api/tmdb/**", ...)` and answer with local fixtures. They never depend on real TMDB data.

## Gotchas

- MSW is started with `onUnhandledRequest: "error"`. A component test that fetches a path with no handler fails with an unhandled request error, which looks like a component failure but is a missing fixture.
- `tests/utils/render.tsx` imports the shared `queryClient` singleton from `app/lib/queryClient.ts` and nothing clears it, so query cache and errors leak between tests in the same file. Call `queryClient.clear()` in a test that needs isolation.
- `IntersectionObserver` does not exist in jsdom, so setup stubs it globally. Anything relying on the infinite scroll sentinel will not actually fire in a component test.
- Playwright's webServer runs `npm run build` first, so `npm run test:e2e` is slow and needs a successful build. Outside CI it reuses an already running server on port 3001, which can mask a stale build.
- The E2E server starts with placeholder `TMDB_BEARER_TOKEN` and `TMDB_API_KEY` values, so any spec that forgets to intercept will get TMDB errors rather than real data.
- The mobile and iPhone projects run a chromium build with a mobile viewport, so a layout that only works in desktop Chrome can still pass the chromium project.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
