# MovieZone Refactor — Decisions

This document records intentional divergences from [FEATURES.md](FEATURES.md), which describes the legacy app.

## Routing

| Legacy | Refactor |
|---|---|
| `/movie/:id`, `/tv/:id` | `/media/:type/:id` |
| `/list/movie/popular`, etc. | `/list/:mediaType/:category` |
| `/genre/:genre/:type/:id` | `/:type/genre/:slug/:id` |
| `/search/:query` | `/search/:query` (unchanged) |

## Home

- Hero uses **trending/day** movies, not now-playing.
- Carousels use **movie/TV toggles** instead of four fixed rows.
- Hero has **5s autoplay** on the Embla carousel.

## Media Details

- **Inline YouTube backdrop** via `VideoBackground` plus a **View Trailers** modal.
- Cast is a **grid** (20 members) with person links, not a carousel.
- TV seasons use a **horizontal scroll row**, not a carousel section.

## Search

- Autocomplete + full results page.
- **Movies and TV only** — people excluded from search (person pages via cast links).

## Pagination

- **Infinite scroll** on list, genre, and search pages (not numbered pages).

## Auth

- Auth is **on-demand**: toast with login link when favorites/watchlist are attempted without a session.
- **Guest sessions** can rate; favorites/watchlist require TMDB OAuth.
- User features shipped in order: **Ratings → Favorites → Watchlist**.

## Tech Stack

| Layer | Legacy | Refactor |
|---|---|---|
| React | 18 | 19 |
| Router | v5 | v7 |
| Data | SWR + Axios | TanStack Query + fetch |
| Styling | Styled Components + Sass | Tailwind CSS v4 |
| Carousels | Swiper | Embla |
| Animations | Framer Motion | `motion` |
