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

export const getAccount = (signal?: AbortSignal) =>
    tmdbFetch<AccountDetails>(`/account`, { signal });

export const getMovieRating = (movieId: string, signal?: AbortSignal) =>
    tmdbFetch<{ rated: boolean; value?: number }>(`/movie/${movieId}/account_states`, {
        signal,
    });

export const getTvRating = (tvId: string, signal?: AbortSignal) =>
    tmdbFetch<{ rated: boolean; value?: number }>(`/tv/${tvId}/account_states`, { signal });

export const rateMovie = (movieId: string, value: number) =>
    tmdbFetch<{ status_code: number; status_message: string }>(`/movie/${movieId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
    });

export const rateTv = (tvId: string, value: number) =>
    tmdbFetch<{ status_code: number; status_message: string }>(`/tv/${tvId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
    });

export const addFavorite = (accountId: number, mediaType: "movie" | "tv", mediaId: number) =>
    tmdbFetch<{ status_code: number }>(`/account/${accountId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_type: mediaType, media_id: mediaId, favorite: true }),
    });

export const removeFavorite = (accountId: number, mediaType: "movie" | "tv", mediaId: number) =>
    tmdbFetch<{ status_code: number }>(`/account/${accountId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_type: mediaType, media_id: mediaId, favorite: false }),
    });

export const addToWatchlist = (accountId: number, mediaType: "movie" | "tv", mediaId: number) =>
    tmdbFetch<{ status_code: number }>(`/account/${accountId}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_type: mediaType, media_id: mediaId, watchlist: true }),
    });

export const removeFromWatchlist = (
    accountId: number,
    mediaType: "movie" | "tv",
    mediaId: number,
) =>
    tmdbFetch<{ status_code: number }>(`/account/${accountId}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_type: mediaType, media_id: mediaId, watchlist: false }),
    });

type AccountStatesRaw = {
    favorite: boolean;
    watchlist: boolean;
    rated?: { value: number };
};

export const getAccountStates = async (
    mediaType: "movie" | "tv",
    mediaId: string,
    signal?: AbortSignal,
) => {
    const raw = await tmdbFetch<AccountStatesRaw>(`/${mediaType}/${mediaId}/account_states`, {
        signal,
    });
    return {
        favorite: raw.favorite,
        watchlist: raw.watchlist,
        rated: !!raw.rated,
        rating: raw.rated?.value,
    };
};

export const getFavoriteMovies = (accountId: number, page: number) =>
    tmdbFetch<PaginatedResponse<MovieResult>>(
        `/account/${accountId}/favorite/movies?page=${page}`,
    );

export const getFavoriteTv = (accountId: number, page: number) =>
    tmdbFetch<PaginatedResponse<TvResult>>(`/account/${accountId}/favorite/tv?page=${page}`);

export const getWatchlistMovies = (accountId: number, page: number) =>
    tmdbFetch<PaginatedResponse<MovieResult>>(
        `/account/${accountId}/watchlist/movies?page=${page}`,
    );

export const getWatchlistTv = (accountId: number, page: number) =>
    tmdbFetch<PaginatedResponse<TvResult>>(`/account/${accountId}/watchlist/tv?page=${page}`);

export const getRatedMovies = (accountId: number, page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(`/account/${accountId}/rated/movies?page=${page}`);

export const getRatedTv = (accountId: number, page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(`/account/${accountId}/rated/tv?page=${page}`);

export const getGuestRatedMovies = (page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(`/guest_session/rated/movies?page=${page}`);

export const getGuestRatedTv = (page: number) =>
    tmdbFetch<PaginatedResponse<RatedItem>>(`/guest_session/rated/tv?page=${page}`);
