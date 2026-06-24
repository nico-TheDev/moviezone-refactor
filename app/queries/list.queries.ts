import { getDiscoverByGenre, getListPage } from "@/api/media.api";
import { getListConfig } from "@/constants/lists";
import type { ListCategory } from "@/constants/lists";
import type { MediaType } from "@/types/tmdb";
import { infiniteQueryOptions } from "@tanstack/react-query";

export const listKeys = {
    all: ["lists"] as const,
    byCategory: (mediaType: MediaType, category: ListCategory) =>
        [...listKeys.all, mediaType, category] as const,
    genre: (mediaType: MediaType, genreKey: string) =>
        [...listKeys.all, "genre", mediaType, genreKey] as const,
};

export const listQueries = {
    infinite: (mediaType: MediaType, category: ListCategory) => {
        const config = getListConfig(mediaType, category);
        return infiniteQueryOptions({
            queryKey: listKeys.byCategory(mediaType, category),
            queryFn: ({ pageParam, signal }) =>
                getListPage(config.endpoint(pageParam), signal),
            initialPageParam: 1,
            getNextPageParam: (lastPage) =>
                lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
        });
    },
    genreInfinite: (mediaType: MediaType, genreIds: number[]) => {
        const genreKey = [...genreIds].sort((a, b) => a - b).join(",");
        return infiniteQueryOptions({
            queryKey: listKeys.genre(mediaType, genreKey),
            queryFn: ({ pageParam, signal }) =>
                getDiscoverByGenre(mediaType, genreIds, pageParam, signal),
            initialPageParam: 1,
            getNextPageParam: (lastPage) =>
                lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
        });
    },
};
