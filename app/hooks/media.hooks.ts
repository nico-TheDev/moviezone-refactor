import { mediaQueries } from "@/queries/media.queries";
import type { MediaType } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";

export const useTrendingTop10 = <T extends MediaType>(mediaType: T) => {
    return useQuery(mediaQueries.top10Trending(mediaType));
};

export const useFeaturedMedia = (mediaType: MediaType) => {
    return useQuery(mediaQueries.featured(mediaType));
};

export const useTopRated = <T extends MediaType>(mediaType: T) => {
    return useQuery(mediaQueries.topRated(mediaType));
};

export const usePopular = <T extends MediaType>(mediaType: T) => {
    return useQuery(mediaQueries.popular(mediaType));
};
