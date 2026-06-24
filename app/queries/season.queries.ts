import { getSeasonDetails } from "@/api/media.api";
import { queryOptions } from "@tanstack/react-query";

export const seasonKeys = {
    all: ["season"] as const,
    details: (showId: string, seasonNumber: string) =>
        [...seasonKeys.all, showId, seasonNumber] as const,
};

export const seasonQueries = {
    details: (showId: string, seasonNumber: string) =>
        queryOptions({
            queryKey: seasonKeys.details(showId, seasonNumber),
            queryFn: ({ signal }) => getSeasonDetails(showId, seasonNumber, signal),
        }),
};
