# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: recruiters, hiring managers and fellow engineers evaluating the author's craft. They arrive from a portfolio link or GitHub, usually spend a few minutes, and judge the product on first impression, polish, and whether it works under real use (search, details, trailers, login, lists).

Secondary audience: anyone who actually uses it to find something to watch. The app must hold up for real browsing, but it does not court a user base.

## Product Purpose

MovieZone is a movie and TV discovery web app powered by the TMDB API: browse trending and curated lists, search, open rich title pages, watch trailers, and keep favorites, a watchlist and ratings (TMDB login or guest session).

It exists as a portfolio piece. Success means a reviewer comes away convinced of production-grade engineering and design judgment: it is fast, looks deliberate in both color schemes, is accessible, and never breaks on a real path.

## Positioning

Fast, cinematic browsing. Imagery leads (backdrops, posters, inline trailer backdrops) and every surface is a short path to a title. Where a plain TMDB browser lists data, MovieZone should feel like a place to choose tonight's watch, quickly.

## Operating Context

- Usually seen in a short evaluation session, on desktop and on a phone, in either OS color scheme.
- Installable PWA with offline caching of shell, API responses and images.
- Reached via portfolio and GitHub links; the footer credits the author.

## Capabilities and Constraints

- Routes: home (hero + movie/TV carousels), category lists, genre browse with multi-select, search with autocomplete (movies and TV only; people reached through cast links), title details with cast, reviews, seasons, recommendations and trailers, season episodes, person pages, login, profile.
- Auth: TMDB OAuth or guest session. Guests can rate; favorites and watchlist need full login. Sessions live in httpOnly cookies set by the BFF.
- The browser never calls TMDB directly; every request goes through the Hono BFF, and credentials never reach the client bundle.
- All content and imagery come from TMDB at runtime; the app owns no editorial content.
- Terminology: "Movies" and "TV Shows" (not "Series").
- Planned work (docs/scope/scope.md): SEO and social metadata, error monitoring, an accessibility pass.

## Brand Commitments

- Name: MovieZone. Logo assets in `public/img/logo.png` and `public/img/logo-light.png`.
- TMDB attribution is mandatory: "Data provided by The Movie Database (TMDB)" plus the not-endorsed notice.

## Evidence on Hand

- Live TMDB data only. There are no testimonials, user counts, press or usage metrics; never fabricate them.

## Product Principles

1. Time to a title wins: every surface should shorten the path to "this one".
2. Imagery leads, interface recedes; chrome exists to frame the artwork.
3. Polish is the product: every state (loading, empty, error, offline, guest) is designed, because reviewers find the edges.
4. Both color schemes and both device classes are first-class.
5. Truthful data: labels describe the query behind them, and nothing is invented.

## Accessibility & Inclusion

Target WCAG 2.2 AA: text contrast ≥4.5:1, controls and focus ≥3:1, full keyboard paths with visible focus, named controls, pausable auto-advancing content, and reduced-motion support.
