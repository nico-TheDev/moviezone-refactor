# MovieZone — Feature List

Powered by the [TMDB API](https://www.themoviedb.org/documentation/api).

---

## Pages

### Home (`/`)
- Auto-rotating featured slider (now-playing movies, 5-second delay)
- Horizontal carousels for: Popular Movies, Trending Movies, Popular TV, Top Rated TV
- Skeleton loading state while data fetches

### Movie Detail (`/movie/:id`)
- Backdrop and poster imagery
- Title, tagline, release date, runtime, vote average
- Genre pills linking to genre browse pages
- Synopsis / overview
- Add to Favorites, Add to Watchlist, Watch Trailer buttons
- 5-star rating widget (authenticated and guest sessions)
- Cast carousel (up to 20 members, links to person pages)
- Reviews section (up to 5 reviews)
- Recommendations grid (up to 12 titles)
- Skeleton loading state; error redirect on failure

### TV Show Detail (`/tv/:id`)
- Same profile, cast, reviews, and recommendations layout as Movie Detail
- Creator credits and episode/season count
- Season carousel (poster, season number, episode count per season)
- Skeleton loading state; error redirect on failure

### Person Detail (`/person/:id`)
- Profile photo, name, popularity score
- Birthday and birthplace
- Biography
- Top 10 most popular film/TV credits (sorted by popularity, deduplicated)
- Skeleton loading state

### Search Results (`/search/:query`)
- Combined movie and TV results from TMDB multi-search
- Results displayed in a responsive card grid
- Pagination across result pages
- Empty state placeholder when no results found

### Genre Browse (`/genre/:genre/:type/:id`)
- Paginated grid of movies or TV shows filtered by genre
- Supports both `movie` and `tv` media types

### Popular Movies (`/list/movie/popular`)
- Paginated grid of currently popular movies

### Top Rated Movies (`/list/movie/toprated`)
- Paginated grid of all-time top rated movies

### Upcoming Movies (`/list/movie/upcoming`)
- Paginated grid of movies with upcoming release dates

### Trending Movies (`/list/movie/trending`)
- Paginated grid of movies trending today

### Popular TV Shows (`/list/tv/popular`)
- Paginated grid of currently popular TV shows

### Top Rated TV Shows (`/list/tv/toprated`)
- Paginated grid of all-time top rated TV shows

### On Air TV Shows (`/list/tv/airing`)
- Paginated grid of TV shows currently airing

### Airing Today TV Shows (`/list/tv/today`)
- Paginated grid of TV shows airing today

### Login (`/login`)
- TMDB OAuth login (redirects to TMDB for approval, returns session)
- Browse as Guest option (guest session, no account required)
- Animated landing layout

### User Profile (`/profile`)
- Protected route — requires login or guest session
- Gravatar avatar, display name, username
- **Authenticated users:** tabbed lists for Favorites, Rated, and Watchlist (movies and TV each)
- **Guest users:** rated movies and TV only (no favorites/watchlist)

### Not Found / Error (`/error/:message`, catch-all)
- Custom message for known errors vs. generic 404
- Button to return to home

---

## Features

### Authentication
- TMDB OAuth flow — request token → user approval → session creation
- Guest session — rate content without an account
- Session and token persistence in `localStorage`
- Logout clears all session state and stored data

### Search
- Live search autocomplete in the navigation bar (up to 5 results shown in dropdown)
- Full search results page with pagination
- Multi-type search covers movies, TV shows, and people

### Ratings
- 5-star rating widget on every movie and TV detail page
- Available to both authenticated users and guest session users
- Loads the user's existing rating on page open
- Posts rating to TMDB; shows success/failure alert

### Favorites
- Add or remove any movie or TV show from favorites
- Requires authenticated session (alert shown to unauthenticated users)
- Reflected live in user profile

### Watchlist
- Add or remove any movie or TV show from watchlist
- Requires authenticated session (alert shown to unauthenticated users)
- Reflected live in user profile

### Trailers
- Modal overlay triggered from detail page profile
- Swiper carousel of embedded YouTube trailer videos

### Genre Navigation
- Genre pills on every detail page link directly to genre browse pages
- Covers all TMDB movie genres

### Pagination
- Page-by-page navigation on all list and search pages
- Total page count sourced from TMDB API response

### Responsive Layout
- Desktop navigation with Movies and TV dropdowns
- Mobile sidebar navigation with search and user profile section
- Responsive grid and carousel breakpoints (450 / 600 / 800 / 1200 px)

### Animations
- Page and list entrance animations via Framer Motion
- Staggered card grid animations
- Intersection-observer–based lazy animations (sliders, recommendations)
- Button hover glow and scale effects

### Loading States
- Full skeleton screens for Home, Movie, TV, and Person pages
- Inline spinner in search autocomplete
- Prevents layout shift during data fetches

### Empty & Error States
- Placeholder UI for empty lists, no search results, no reviews, no recommendations
- Error boundaries redirect to `/error` with a contextual message

---

## Navigation Structure

```
Nav
├─ Logo → Home
├─ Search (autocomplete)
├─ Movies
│   ├─ Trending
│   ├─ Popular
│   ├─ Upcoming
│   └─ Top Rated
├─ TV Shows
│   ├─ Top Rated
│   ├─ Popular
│   ├─ On Air
│   └─ Airing Today
└─ Profile / Login
    ├─ Login (unauthenticated)
    ├─ Browse as Guest (unauthenticated)
    ├─ Profile link (authenticated/guest)
    └─ Logout (authenticated/guest)

Footer
├─ Author credit
├─ TMDB attribution
└─ Social links (Twitter, GitHub)
```

---

## Tech Stack

| Layer | Library |
|---|---|
| Build | Vite 8 |
| UI | React 18 |
| Routing | React Router v5 |
| Data Fetching | SWR + Axios |
| Styling | Styled Components + Sass |
| Carousels | Swiper.js |
| Animations | Framer Motion |
| Intersection Observer | react-intersection-observer |
| API | TMDB v3 |
