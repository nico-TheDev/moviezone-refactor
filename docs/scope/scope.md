# Scope: MovieZone

A movie and TV discovery app powered by the TMDB API, with a React client and a Hono backend for frontend that keeps the API credentials on the server. It began as a refactor of an earlier version and now works end to end. This pass hardens it rather than growing it.

**Build approach:** Tracer Bullet (prove the whole pattern on one route, then widen it route by route).
**Workflow:** Beta (after `/develop`: `/check verify`, then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | existing |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Discovery browsing | Already built | existing |
| 4 | Title details | Already built | existing |
| 5 | Person pages | Already built | existing |
| 6 | Authentication and sessions | Already built | existing |
| 7 | Ratings, favorites and watchlist | Already built | existing |
| 8 | Profile | Already built | existing |
| 9 | Trailer playback | Already built | existing |
| 10 | App shell and states | Already built | existing |
| 11 | BFF hardening | Already built | existing |
| 12 | PWA and offline support | Already built | existing |
| 13 | Test and CI pipeline | Already built | existing |
| 14 | SEO and social metadata | Slice 1 | planned |
| 15 | Error monitoring | Slice 2 | planned |
| 16 | Accessibility pass | Slice 3 | planned |

## Foundation

### 1. Stack & architecture · existing
React 19 and React Router 7 in SPA mode, Vite 8, a Hono BFF on Node, Tailwind v4, and a GitHub Actions pipeline. Already decided and running; recorded for context. code in `./`, `app/`, `server/`

### 2. Coding standards & tooling · done · Prototype
The conventions are captured in `AGENTS.md`, but nothing enforces them: there is no linter or formatter config anywhere. Worth closing first, because the rest of this pass edits many existing files.
**Done when:** one command lints and formats the repo clean, a check that runs before each commit blocks a bad one, and the commands are written down for the next reader. spec [0001](../specs/0001-coding-standards-tooling/index.md) · code in `biome.json`, `.githooks/pre-commit`, `scripts/setup-hooks.mjs`, `.github/workflows/ci.yml`
- [x] Capture conventions: `/audit`
- [x] Install and wire the tooling: `/develop tooling`

## Already built

Enrolled for context. These predate the workflow, so `/develop` and `/sync` leave them alone.

### 3. Discovery browsing · existing
Home carousels with movie and TV toggles, the category list pages, genre browse with multi genre select, and search with autocomplete. Infinite scroll replaces numbered pages. code in `app/routes/home.tsx`, `app/routes/list.tsx`, `app/routes/genre-browse.tsx`, `app/routes/search.tsx`

### 4. Title details · existing
Movie and TV detail pages with cast, reviews, recommendations, and seasons, plus a season episode page. code in `app/routes/media-details.tsx`, `app/routes/season-details.tsx`

### 5. Person pages · existing
Profile, biography, and a deduplicated top credits list. code in `app/routes/person.tsx`

### 6. Authentication and sessions · existing
TMDB OAuth login, guest sessions, and logout, with sessions held in httpOnly cookies set by the BFF. code in `server/auth-routes.ts`, `app/routes/login.tsx`, `app/stores/auth.ts`

### 7. Ratings, favorites and watchlist · existing
Five star rating works for guests and logged in users; favorites and watchlist require a full login. code in `app/api/account.api.ts`, `app/components/MediaActionButtons.tsx`, `app/components/RatingWidget.tsx`

### 8. Profile · existing
Tabbed favorites, rated, and watchlist views per media type, with guests limited to their rated titles. code in `app/routes/profile.tsx`

### 9. Trailer playback · existing
An inline backdrop video plus a trailer modal, served from the YouTube nocookie domain to satisfy the content security policy. code in `app/components/TrailerModal.tsx`, `app/components/VideoBackground.tsx`

### 10. App shell and states · existing
Responsive navigation with a mobile drawer, entrance animations, loading skeletons, and shared empty and error states. code in `app/components/layout/`, `app/components/ui/`

### 11. BFF hardening · existing
Rate limiting per IP and per session, a response cache, security headers with a content security policy, path sanitizing, and static hosting with an SPA fallback. code in `server/`

### 12. PWA and offline support · existing
Service worker caching for the shell, API responses, and images, with an installable manifest and an offline banner. code in `app/lib/registerPwa.ts`, `vite.config.ts`, `public/`

### 13. Test and CI pipeline · existing
Vitest with Testing Library and MSW for units and components, Playwright smoke flows over desktop and mobile viewports, and CI that typechecks, tests, builds, verifies the PWA artifacts, and greps the bundle for the TMDB token. code in `tests/`, `e2e/`, `.github/workflows/`

## Slice 1: Crawlable and shareable

### 14. SEO and social metadata · needs a decision
Give every public route its own title, description, and canonical URL, and make a shared link render a real preview card. The hard part is delivery: the app ships as a single page app with no server rendering, so decide how metadata reaches crawlers and social scrapers that do not run JavaScript, prove it on one route, then cover the rest. Highest risk item in the pass, because it can force a change to the build or the way the app is served.
**Done when:** every public route serves distinct metadata that a crawler sees without running JavaScript, a shared link shows the right preview card, and a sitemap and robots file are served.
- [ ] Design it (spec): `/architect SEO and social metadata`

## Slice 2: Observable failures

### 15. Error monitoring · needs a decision
Capture errors from the browser and the BFF in one place with readable stack traces, so a failure stops being invisible and a portfolio visitor never hits a silent broken screen. Decide the sink and how source maps get there, then prove the whole path with one real thrown error before wiring the rest.
**Done when:** an unhandled client error and a BFF exception both arrive in the sink with a trace that maps to real source, and the root error boundary reports rather than only rendering a message.
- [ ] Design it (spec): `/architect error monitoring`

## Slice 3: Accessible to everyone

### 16. Accessibility pass · needs a decision
Make the app usable by keyboard and screen reader against a documented standard instead of ad hoc fixes. Decide the target level and the strategy for focus management in the modal and the mobile drawer, then apply it across the shared components and the routes.
**Done when:** every interactive control is reachable and labelled, focus is trapped and restored in the modal and drawer, the main routes meet the chosen target, and an automated check runs in CI.
- [ ] Design it (spec): `/architect accessibility pass`

## Deferred

Out of scope for this pass, kept so the plan stays honest. Each one is a real option for a later pass, not a rejection.

- **Product analytics**: measure page views and key actions · needs a decision
- **Performance budgets**: measured Core Web Vitals targets plus a bundle and image budget · needs a decision
- **Internationalization**: a language switcher and translated strings · needs a decision
- **Custom and shared lists**: user created lists beyond favorites and watchlist · needs a decision
- **Personalized recommendations**: a row or page driven by what you rated and favorited · needs a decision
- **Release notifications**: tell people when a watched title releases or a season airs · needs a decision
- **Privacy and terms pages**: required only if tracking is ever added · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the single task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+); anything surfaced during the build is enrolled |
| `in-progress` (building) | `/develop` | milestone boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards and tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (it predates the workflow) and `dropped` (removed from scope, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing; **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

_Drafted by /scope from your answers, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated._
