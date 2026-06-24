import {
    getDetails,
    getFeatured,
    getGenres,
    getPopular,
    getTopRated,
    getTrendingTop10,
    getVideos,
} from "@/api/media.api";
import type { DetailsWithAppendByType, MediaType, MovieVideo } from "@/types/tmdb";
import { pickBackgroundVideo } from "@/utils/video-helpers";
import { queryOptions } from "@tanstack/react-query";

export const mediaKeys = {
    all: ["media"] as const,
    top10Trending: (mediaType: MediaType) =>
        [...mediaKeys.byType(mediaType), "top10Trending"] as const,
    byType: (mediaType: MediaType) => [...mediaKeys.all, mediaType] as const,
    featured: (mediaType: MediaType) => [...mediaKeys.byType(mediaType), "featured"] as const,
    genres: (mediaType: MediaType) => [...mediaKeys.byType(mediaType), "genres"] as const,
    details: (mediaType: MediaType, id: string) =>
        [...mediaKeys.byType(mediaType), "details", id] as const,
    videos: (mediaType: MediaType, id: string) =>
        [...mediaKeys.byType(mediaType), "videos", id] as const,
    topRated: (mediaType: MediaType) => [...mediaKeys.byType(mediaType), "topRated"] as const,
    popular: (mediaType: MediaType) => [...mediaKeys.byType(mediaType), "popular"] as const,
};

export const mediaQueries = {
    top10Trending: <T extends MediaType>(mediaType: T) =>
        queryOptions({
            queryKey: mediaKeys.top10Trending(mediaType),
            queryFn: ({ signal }) => getTrendingTop10(mediaType, signal),
            select: (data) => data.results.slice(0, 10) ?? [],
        }),
    featured: <T extends MediaType>(mediaType: T) =>
        queryOptions({
            queryKey: mediaKeys.featured(mediaType),
            queryFn: ({ signal }) => getFeatured(mediaType, signal),
            select: (data) => data.results.slice(0, 10),
        }),
    details: <T extends MediaType>(mediaType: T, id: string) =>
        queryOptions({
            queryKey: mediaKeys.details(mediaType, id),
            queryFn: ({ signal }) => getDetails(mediaType, id, signal),
            select: (data: DetailsWithAppendByType<MediaType>) => ({
                ...data,
                credits: data?.credits?.cast?.slice(0, 12),
                reviews: data?.reviews?.results?.slice(0, 5),
                recommendations: data?.recommendations?.results?.slice(0, 12),
                images: data?.images?.logos?.slice(0, 10),
                videos: pickBackgroundVideo(data?.videos?.results ?? []),
            }),
        }),
    videos: (mediaType: MediaType, id: string) =>
        queryOptions({
            queryKey: mediaKeys.videos(mediaType, id),
            queryFn: ({ signal }) => getVideos(mediaType, id, signal),
            staleTime: 1000 * 60 * 60,
            select: (data) => pickBackgroundVideo(data.results ?? []),
        }),
    genres: (mediaType: MediaType) =>
        queryOptions({
            queryKey: mediaKeys.genres(mediaType),
            queryFn: ({ signal }) => getGenres(mediaType, signal),
            // fetch once and never refetch since genres rarely change
            staleTime: Infinity,
            select: (data) =>
                data.genres
                    ? data.genres.reduce((acc, genre) => {
                          acc.set(genre.id, genre.name || "Unknown");
                          return acc;
                      }, new Map<number, string>())
                    : new Map<number, string>(),
        }),
    topRated: <T extends MediaType>(mediaType: T) =>
        queryOptions({
            queryKey: mediaKeys.topRated(mediaType),
            queryFn: ({ signal }) => getTopRated(mediaType, signal),
            select: (data) => data.results.slice(0, 10) ?? [],
        }),
    popular: <T extends MediaType>(mediaType: T) =>
        queryOptions({
            queryKey: mediaKeys.popular(mediaType),
            queryFn: ({ signal }) => getPopular(mediaType, signal),
            select: (data) => data.results.slice(0, 10) ?? [],
        }),
};
