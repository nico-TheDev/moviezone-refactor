import { tmdbFetch } from "@/api/client";
import type { MovieResult, PaginatedResponse, TvResult } from "@/types/tmdb";

export type SearchMediaResult = (MovieResult | TvResult) & {
    media_type: "movie" | "tv";
};

type MultiSearchResponse = PaginatedResponse<SearchMediaResult>;

export const searchMulti = (query: string, page: number, signal?: AbortSignal) =>
    tmdbFetch<MultiSearchResponse>(
        `/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=en-US&include_adult=false`,
        { signal },
    );
