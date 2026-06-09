import { tmdbFetch } from "@/api/client";
import type { MovieResult, PaginatedResponse, TvResult } from "@/types/tmdb";

type AccountDetails = {
    id: number;
    username: string;
    name: string;
    avatar?: { gravatar?: { hash?: string } };
};

type RatedItem = {
    id: number;
    rating: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
};

export const getAccount = (sessionId: string, signal?: AbortSignal) =>
    tmdbFetch<AccountDetails>(`/account?session_id=${sessionId}`, { signal });

export const getMovieRating = (movieId: string, sessionId: string, signal?: AbortSignal) =>
    tmdbFetch<{ rated: boolean; value?: number }>(
        `/movie/${movieId}/account_states?session_id=${sessionId}`,
        { signal },
    );

export const getTvRating = (tvId: string, sessionId: string, signal?: AbortSignal) =>
    tmdbFetch<{ rated: boolean; value?: number }>(
        `/tv/${tvId}/account_states?session_id=${sessionId}`,
        { signal },
    );

export const rateMovie = (movieId: string, sessionId: string, value: number) =>
    tmdbFetch<{ status_code: number; status_message: string }>(
        `/movie/${movieId}/rating?session_id=${sessionId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
        },
    );

export const rateTv = (tvId: string, sessionId: string, value: number) =>
    tmdbFetch<{ status_code: number; status_message: string }>(
        `/tv/${tvId}/rating?session_id=${sessionId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
        },
    );

export const addFavorite = (
    accountId: number,
    sessionId: string,
    mediaType: "movie" | "tv",
    mediaId: number,
) =>
    tmdbFetch<{ status_code: number }>(
        `/account/${accountId}/favorite?session_id=${sessionId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ media_type: mediaType, media_id: mediaId, favorite: true }),
        },
    );

export const removeFavorite = (
    accountId: number,
    sessionId: string,
    mediaType: "movie" | "tv",
    mediaId: number,
) =>
    tmdbFetch<{ status_code: number }>(
        `/account/${accountId}/favorite?session_id=${sessionId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ media_type: mediaType, media_id: mediaId, favorite: false }),
        },
    );

export const addToWatchlist = (
    accountId: number,
    sessionId: string,
    mediaType: "movie" | "tv",
    mediaId: number,
) =>
    tmdbFetch<{ status_code: number }>(
        `/account/${accountId}/watchlist?session_id=${sessionId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ media_type: mediaType, media_id: mediaId, watchlist: true }),
        },
    );

export const removeFromWatchlist = (
    accountId: number,
    sessionId: string,
    mediaType: "movie" | "tv",
    mediaId: number,
) =>
    tmdbFetch<{ status_code: number }>(
        `/account/${accountId}/watchlist?session_id=${sessionId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ media_type: mediaType, media_id: mediaId, watchlist: false }),
        },
    );

export const getAccountStates = (
    mediaType: "movie" | "tv",
    mediaId: string,
    sessionId: string,
    signal?: AbortSignal,
) =>
    tmdbFetch<{
        favorite: boolean;
        watchlist: boolean;
        rated: boolean;
        rating?: number;
    }>(`/${mediaType}/${mediaId}/account_states?session_id=${sessionId}`, { signal });

export const getFavoriteMovies = (accountId: number, sessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<MovieResult>>(
        `/account/${accountId}/favorite/movies?session_id=${sessionId}&page=${page}`,
    );

export const getFavoriteTv = (accountId: number, sessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<TvResult>>(
        `/account/${accountId}/favorite/tv?session_id=${sessionId}&page=${page}`,
    );

export const getWatchlistMovies = (accountId: number, sessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<MovieResult>>(
        `/account/${accountId}/watchlist/movies?session_id=${sessionId}&page=${page}`,
    );

export const getWatchlistTv = (accountId: number, sessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<TvResult>>(
        `/account/${accountId}/watchlist/tv?session_id=${sessionId}&page=${page}`,
    );

export const getRatedMovies = (accountId: number, sessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(
        `/account/${accountId}/rated/movies?session_id=${sessionId}&page=${page}`,
    );

export const getRatedTv = (accountId: number, sessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(
        `/account/${accountId}/rated/tv?session_id=${sessionId}&page=${page}`,
    );

export const getGuestRatedMovies = (guestSessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(
        `/guest_session/${guestSessionId}/rated/movies?page=${page}`,
    );

export const getGuestRatedTv = (guestSessionId: string, page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(
        `/guest_session/${guestSessionId}/rated/tv?page=${page}`,
    );
