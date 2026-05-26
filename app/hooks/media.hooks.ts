import { mediaQueries } from "@/queries/media.queries";
import { useQuery } from "@tanstack/react-query";

export const useTrendingTop10 = () => {
    return useQuery(mediaQueries.top10Trending());
};
