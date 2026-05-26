import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";

type FeaturedItem = MovieResult | TvResult;

export function isMovieResult(item: FeaturedItem): item is MovieResult {
    return "title" in item;
}

export function getTitle(item: FeaturedItem): string | undefined {
    return isMovieResult(item) ? item.title : item.name;
}

export function getReleaseYear(item: FeaturedItem): string | undefined {
    const date = isMovieResult(item) ? item.release_date : item.first_air_date;
    return date?.slice(0, 4);
}
