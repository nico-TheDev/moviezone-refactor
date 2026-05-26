import {
    getDetails,
    getFeatured,
    getFeaturedMoviesAndTVShows,
    getGenres,
    getVideos,
} from "@/api/media.api";
import type { MediaType, MovieVideo } from "@/types/tmdb";
import { queryOptions } from "@tanstack/react-query";

export const mediaKeys = {
    all: ["media"] as const,
    byType: (mediaType: MediaType) => [...mediaKeys.all, mediaType] as const,
    featuredMoviesAndTVShows: () => [...mediaKeys.all, "featuredMoviesAndTVShows"] as const,
    featured: (mediaType: MediaType) => [...mediaKeys.byType(mediaType), "featured"] as const,
    genres: (mediaType: MediaType) => [...mediaKeys.byType(mediaType), "genres"] as const,
    details: (mediaType: MediaType, id: string) =>
        [...mediaKeys.byType(mediaType), "details", id] as const,
    videos: (mediaType: MediaType, id: string) =>
        [...mediaKeys.byType(mediaType), "videos", id] as const,
};

function pickBackgroundVideo(videos: MovieVideo[]): MovieVideo | undefined {
    return videos
        .filter((v) => v.site === "YouTube")
        .sort((a, b) => {
            const score = (v: MovieVideo) =>
                (v.official ? 100 : 0) +
                (v.type === "Trailer" ? 10 : v.type === "Teaser" ? 5 : 0) +
                (v.iso_639_1 === "en" ? 3 : 0) +
                (v.size ?? 0) / 1000;
            return score(b) - score(a);
        })[0];
}

export const mediaQueries = {
    featuredMoviesAndTVShows: () =>
        queryOptions({
            queryKey: mediaKeys.featuredMoviesAndTVShows(),
            queryFn: ({ signal }) => getFeaturedMoviesAndTVShows(signal),
        }),
    featured: (mediaType: MediaType) =>
        queryOptions({
            queryKey: mediaKeys.featured(mediaType),
            queryFn: ({ signal }) => getFeatured(mediaType, signal),
        }),
    details: <T extends MediaType>(mediaType: T, id: string) =>
        queryOptions({
            queryKey: mediaKeys.details(mediaType, id),
            queryFn: ({ signal }) => getDetails(mediaType, id, signal),
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
};
