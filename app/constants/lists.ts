import type { MediaType } from "@/types/tmdb";

export type ListCategory =
    | "popular"
    | "toprated"
    | "upcoming"
    | "trending"
    | "airing"
    | "today";

type ListConfig = {
    title: string;
    endpoint: (page: number) => string;
};

export const MOVIE_LISTS: Record<Exclude<ListCategory, "airing" | "today">, ListConfig> = {
    popular: {
        title: "Popular Movies",
        endpoint: (page) => `/movie/popular?page=${page}&language=en-US`,
    },
    toprated: {
        title: "Top Rated Movies",
        endpoint: (page) => `/movie/top_rated?page=${page}&language=en-US`,
    },
    upcoming: {
        title: "Upcoming Movies",
        endpoint: (page) => `/movie/upcoming?page=${page}&language=en-US`,
    },
    trending: {
        title: "Trending Movies",
        endpoint: (page) => `/trending/movie/day?page=${page}&language=en-US`,
    },
};

export const TV_LISTS: Record<Exclude<ListCategory, "upcoming" | "trending">, ListConfig> = {
    popular: {
        title: "Popular TV Shows",
        endpoint: (page) => `/tv/popular?page=${page}&language=en-US`,
    },
    toprated: {
        title: "Top Rated TV Shows",
        endpoint: (page) => `/tv/top_rated?page=${page}&language=en-US`,
    },
    airing: {
        title: "On Air TV Shows",
        endpoint: (page) => `/tv/on_the_air?page=${page}&language=en-US`,
    },
    today: {
        title: "Airing Today TV Shows",
        endpoint: (page) => `/tv/airing_today?page=${page}&language=en-US`,
    },
};

export function assertListCategory(
    mediaType: MediaType,
    category: string,
): ListCategory {
    const valid =
        mediaType === "movie"
            ? category in MOVIE_LISTS
            : category in TV_LISTS;
    if (!valid) {
        throw new Response(`Unknown list category: ${category}`, { status: 404 });
    }
    return category as ListCategory;
}

export function getListConfig(mediaType: MediaType, category: ListCategory): ListConfig {
    if (mediaType === "movie") {
        return MOVIE_LISTS[category as keyof typeof MOVIE_LISTS];
    }
    return TV_LISTS[category as keyof typeof TV_LISTS];
}

export const NAV_MOVIE_LINKS = [
    { label: "Trending", category: "trending" as const },
    { label: "Popular", category: "popular" as const },
    { label: "Upcoming", category: "upcoming" as const },
    { label: "Top Rated", category: "toprated" as const },
];

export const NAV_TV_LINKS = [
    { label: "Top Rated", category: "toprated" as const },
    { label: "Popular", category: "popular" as const },
    { label: "On Air", category: "airing" as const },
    { label: "Airing Today", category: "today" as const },
];
