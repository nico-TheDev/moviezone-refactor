import { searchMulti } from "@/api/search.api";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

export const searchKeys = {
    all: ["search"] as const,
    query: (q: string) => [...searchKeys.all, q] as const,
    autocomplete: (q: string) => [...searchKeys.all, "autocomplete", q] as const,
};

export const searchQueries = {
    autocomplete: (query: string) =>
        queryOptions({
            queryKey: searchKeys.autocomplete(query),
            queryFn: ({ signal }) => searchMulti(query, 1, signal),
            enabled: query.trim().length >= 2,
            select: (data) =>
                data.results
                    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
                    .slice(0, 5),
            staleTime: 30_000,
        }),
    infinite: (query: string) =>
        infiniteQueryOptions({
            queryKey: searchKeys.query(query),
            queryFn: async ({ pageParam, signal }) => {
                const page = await searchMulti(query, pageParam, signal);
                return {
                    ...page,
                    results: page.results.filter(
                        (r) => r.media_type === "movie" || r.media_type === "tv",
                    ),
                };
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) =>
                lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
            enabled: query.trim().length > 0,
        }),
};
