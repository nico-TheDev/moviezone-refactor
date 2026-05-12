import { getFeaturedMovies, getGenresList } from "@/api/movies.api";
import { API } from "@/constants/api";
import { queryOptions } from "@tanstack/react-query";

export const moviesKeys = {
    all: ["movies"] as const,
    featured: () => [...moviesKeys.all, "featured"] as const,
    genres: () => [...moviesKeys.all, "genres"] as const,
};

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
};
