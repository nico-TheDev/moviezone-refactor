import type { operations } from "./tmdb.generated";

type ResponseBody<T extends keyof operations> =
    operations[T]["responses"][200]["content"]["application/json"];

// --- Detail types ---
export type Movie = ResponseBody<"movie-details">;
export type TvShow = ResponseBody<"tv-series-details">;
export type Person = ResponseBody<"person-details">;

// --- Movie videos ---
export type MovieVideosResponse = ResponseBody<"movie-videos">;
export type MovieVideo = NonNullable<MovieVideosResponse["results"]>[number];

// --- List item types ---
export type MovieResult = NonNullable<ResponseBody<"discover-movie">["results"]>[number];
export type TvResult = NonNullable<ResponseBody<"discover-tv">["results"]>[number];
export type PersonResult = NonNullable<ResponseBody<"trending-people">["results"]>[number];

// --- Genres ---
export type Genre = NonNullable<ResponseBody<"genre-movie-list">["genres"]>[number];
export type GenreListResponse = ResponseBody<"genre-movie-list">;
export type TvGenreListResponse = ResponseBody<"genre-tv-list">;
export type GenreMap = Map<number, string>;

// --- Paginated wrapper ---
export type PaginatedResponse<T> = {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
};

// --- Media type discriminator ---
export type MediaType = "movie" | "tv";

// --- Multi-search discriminated union ---
export type MultiSearchResult =
    | (MovieResult & { media_type: "movie" })
    | (TvResult & { media_type: "tv" })
    | (PersonResult & { media_type: "person" });
