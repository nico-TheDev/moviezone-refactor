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
            select: (data) => {
                if (!data.genres) {
                    throw new Error("Invalid genres data");
                }
                console.log(data);
                // Transform the genres list into a map for easier access
                const genresMap: Record<number, string> = {};
                data.genres.forEach((genre) => {
                    genresMap[genre.id] = genre.name || "Unknown";
                });
                return genresMap;
            },
        }),
};
