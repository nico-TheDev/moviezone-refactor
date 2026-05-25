import {
    getFeaturedMovies,
    getGenresList,
    getMovieDetails,
    getMovieVideos,
} from "@/api/movies.api";
import { API } from "@/constants/api";
import type { MovieVideo } from "@/types/tmdb";
import { queryOptions } from "@tanstack/react-query";

export const moviesKeys = {
    all: ["movies"] as const,
    featured: () => [...moviesKeys.all, "featured"] as const,
    genres: () => [...moviesKeys.all, "genres"] as const,
    movieDetails: (movieId: string) => [...moviesKeys.all, "movieDetails", movieId] as const,
    movieVideos: (movieId: string) => [...moviesKeys.all, "movieVideos", movieId] as const,
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

// Query functions for movies
export const moviesQueries = {
    featured: () =>
        queryOptions({
            queryKey: moviesKeys.featured(),
            queryFn: getFeaturedMovies,
        }),
    genres: () =>
        queryOptions({
            queryKey: moviesKeys.genres(),
            queryFn: getGenresList,
            staleTime: Infinity, // fetch once and never refetch since genres don't change often,
            select: (data) =>
                data.genres
                    ? data.genres.reduce((acc, genre) => {
                          acc.set(genre.id, genre.name || "Unknown");
                          return acc;
                      }, new Map<number, string>())
                    : new Map<number, string>(),
        }),
    movieDetails: (movieId: string) =>
        queryOptions({
            queryKey: moviesKeys.movieDetails(movieId),
            queryFn: () => getMovieDetails(movieId),
        }),
    movieVideos: (movieId: string) =>
        queryOptions({
            queryKey: moviesKeys.movieVideos(movieId),
            queryFn: () => getMovieVideos(movieId),
            staleTime: 1000 * 60 * 60,
            select: (data) => pickBackgroundVideo(data.results ?? []),
        }),
};
