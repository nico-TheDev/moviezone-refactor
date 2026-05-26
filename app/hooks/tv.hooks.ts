import { mediaQueries } from "@/queries/media.queries";
import { useQuery } from "@tanstack/react-query";

export const useFeaturedMoviesAndTVShows = () => {
    return useQuery(mediaQueries.featuredMoviesAndTVShows());
};

export const useTvGenres = () => {
    return useQuery(mediaQueries.genres("tv"));
};

export const useTvShowDetails = (tvShowId: string) => {
    return useQuery(mediaQueries.details("tv", tvShowId));
};

export const useTvShowVideos = (tvShowId: string) => {
    return useQuery(mediaQueries.videos("tv", tvShowId));
};
