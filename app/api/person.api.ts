import { tmdbFetch } from "@/api/client";
import type { MovieResult, Person, TvResult } from "@/types/tmdb";

type CombinedCreditsResponse = {
    cast: Array<
        (MovieResult | TvResult) & {
            media_type: "movie" | "tv";
            character?: string;
        }
    >;
};

export const getPersonDetails = (id: string, signal?: AbortSignal) =>
    tmdbFetch<Person>(`/person/${id}?language=en-US`, { signal });

export const getPersonCombinedCredits = (id: string, signal?: AbortSignal) =>
    tmdbFetch<CombinedCreditsResponse>(`/person/${id}/combined_credits?language=en-US`, {
        signal,
    });
