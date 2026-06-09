import { getDiscoverByGenre, getListPage } from "@/api/media.api";
import { getListConfig } from "@/constants/lists";
import type { ListCategory } from "@/constants/lists";
import type { MediaType } from "@/types/tmdb";
import { infiniteQueryOptions } from "@tanstack/react-query";

export const listKeys = {
    all: ["lists"] as const,
    byCategory: (mediaType: MediaType, category: ListCategory) =>
        [...listKeys.all, mediaType, category] as const,
    genre: (mediaType: MediaType, genreId: string) =>
        [...listKeys.all, "genre", mediaType, genreId] as const,
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
    genreInfinite: (mediaType: MediaType, genreId: string) =>
        infiniteQueryOptions({
            queryKey: listKeys.genre(mediaType, genreId),
            queryFn: ({ pageParam, signal }) =>
                getDiscoverByGenre(mediaType, genreId, pageParam, signal),
            initialPageParam: 1,
            getNextPageParam: (lastPage) =>
                lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
        }),
};
