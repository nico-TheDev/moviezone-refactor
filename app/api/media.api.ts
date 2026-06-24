import { tmdbFetch } from "@/api/client";
import type {
    DetailsWithAppendByType,
    GenreListResponse,
    MediaType,
    MovieResult,
    MovieVideosResponse,
    PaginatedResponse,
    SeasonDetails,
    TvResult,
} from "@/types/tmdb";

type ResultByType<T extends MediaType> = T extends "movie" ? MovieResult : TvResult;

export const getFeatured = <T extends MediaType>(mediaType: T, signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<ResultByType<T>>>(
        `/discover/${mediaType}?sort_by=popularity.desc`,
        { signal },
    );

export const getTrendingTop10 = (mediaType: MediaType, signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<MovieResult | TvResult>>(
        `/trending/${mediaType}/day?language=en-US`,
        {
            signal,
        },
    );

export const getDetails = <T extends MediaType>(mediaType: T, id: string, signal?: AbortSignal) =>
    tmdbFetch<DetailsWithAppendByType<T>>(
        `/${mediaType}/${id}?append_to_response=credits,reviews,recommendations,images,videos`,
        {
            signal,
        },
    );

export const getVideos = (mediaType: MediaType, id: string, signal?: AbortSignal) =>
    tmdbFetch<MovieVideosResponse>(`/${mediaType}/${id}/videos`, { signal });

export const getGenres = (mediaType: MediaType, signal?: AbortSignal) =>
    tmdbFetch<GenreListResponse>(`/genre/${mediaType}/list?language=en`, { signal });

export const getTopRated = (mediaType: MediaType, signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<MovieResult | TvResult>>(`/${mediaType}/top_rated`, { signal });

export const getPopular = (mediaType: MediaType, signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<MovieResult | TvResult>>(`/${mediaType}/popular`, { signal });

export const getListPage = (path: string, signal?: AbortSignal) =>
    tmdbFetch<PaginatedResponse<MovieResult | TvResult>>(path, { signal });

export const getDiscoverByGenre = (
    mediaType: MediaType,
    genreIds: number[],
    page: number,
    signal?: AbortSignal,
) =>
    tmdbFetch<PaginatedResponse<MovieResult | TvResult>>(
        `/discover/${mediaType}?with_genres=${genreIds.join(",")}&page=${page}&language=en-US&sort_by=popularity.desc`,
        { signal },
    );

export const getAllVideos = (mediaType: MediaType, id: string, signal?: AbortSignal) =>
    tmdbFetch<MovieVideosResponse>(`/${mediaType}/${id}/videos`, { signal });

export const getSeasonDetails = (
    showId: string,
    seasonNumber: string,
    signal?: AbortSignal,
) =>
    tmdbFetch<SeasonDetails>(`/tv/${showId}/season/${seasonNumber}`, { signal });
