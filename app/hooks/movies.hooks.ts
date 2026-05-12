import { moviesQueries } from "@/queries/movies.queries";
import type { MovieResult } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";

export const useFeaturedMovies = () => {
    return useQuery(moviesQueries.featured());
};

export const useMovieGenres = () => {
    return useQuery(moviesQueries.genres());
};
