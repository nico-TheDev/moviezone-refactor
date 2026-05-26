import { tmdbFetch } from "@/api/client";
import type {
    GenreListResponse,
    MediaType,
    Movie,
    MovieResult,
    MovieVideosResponse,
    PaginatedResponse,
    TvResult,
    TvShow,
} from "@/types/tmdb";

type DetailsByType<T extends MediaType> = T extends "movie" ? Movie : TvShow;
type ResultByType<T extends MediaType> = T extends "movie" ? MovieResult : TvResult;

export const getFeatured = <T extends MediaType>(mediaType: T, signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<ResultByType<T>>>(
        `/discover/${mediaType}?sort_by=popularity.desc`,
        { signal },
    );

export const getTrendingTop10 = (signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<MovieResult | TvResult>>(`/trending/all/day?language=en-US`, {
        signal,
    });

export const getFeaturedMoviesAndTVShows = async (signal?: AbortSignal) => {
    const [movies, tvShows] = await Promise.all([
        tmdbFetch<PaginatedResponse<ResultByType<"movie">>>(
            `/discover/movie?sort_by=popularity.desc`,
            {
                signal,
            },
        ),
        tmdbFetch<PaginatedResponse<ResultByType<"tv">>>(`/discover/tv?sort_by=popularity.desc`, {
            signal,
        }),
    ]);

    return [...movies.results.slice(0, 10), ...tvShows.results.slice(0, 10)];
};

export const getDetails = <T extends MediaType>(mediaType: T, id: string, signal?: AbortSignal) =>
    tmdbFetch<DetailsByType<T>>(`/${mediaType}/${id}`, { signal });

export const getVideos = (mediaType: MediaType, id: string, signal?: AbortSignal) =>
    tmdbFetch<MovieVideosResponse>(`/${mediaType}/${id}/videos`, { signal });

export const getGenres = (mediaType: MediaType, signal?: AbortSignal) =>
    tmdbFetch<GenreListResponse>(`/genre/${mediaType}/list?language=en`, { signal });
