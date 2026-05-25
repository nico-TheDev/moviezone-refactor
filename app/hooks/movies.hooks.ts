import { moviesQueries } from "@/queries/movies.queries";
import type { MovieResult } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";

export const useFeaturedMovies = () => {
    return useQuery(moviesQueries.featured());
};

export const useMovieGenres = () => {
    return useQuery(moviesQueries.genres());
};

export const useMovieDetails = (movieId: string) => {
    return useQuery(moviesQueries.movieDetails(movieId));
};

export const useMovieVideos = (movieId: string) => {
    return useQuery(moviesQueries.movieVideos(movieId));
};
