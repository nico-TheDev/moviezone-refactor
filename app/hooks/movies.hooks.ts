import { mediaQueries } from "@/queries/media.queries";
import { useQuery } from "@tanstack/react-query";

export const useFeaturedMovies = () => {
    return useQuery(mediaQueries.featured("movie"));
};

export const useMovieGenres = () => {
    return useQuery(mediaQueries.genres("movie"));
};

export const useMovieDetails = (movieId: string) => {
    return useQuery(mediaQueries.details("movie", movieId));
};

export const useMovieVideos = (movieId: string) => {
    return useQuery(mediaQueries.videos("movie", movieId));
};
