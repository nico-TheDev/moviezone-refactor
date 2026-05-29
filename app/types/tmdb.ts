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
export type TvVideosResponse = ResponseBody<"tv-series-videos">;

// --- Appended details payloads ---
export type MovieCreditsResponse = ResponseBody<"movie-credits">;
export type TvCreditsResponse = ResponseBody<"tv-series-credits">;
export type MovieReviewsResponse = ResponseBody<"movie-reviews">;
export type TvReviewsResponse = ResponseBody<"tv-series-reviews">;
export type MovieRecommendationsResponse = ResponseBody<"movie-recommendations">;
export type TvRecommendationsResponse = ResponseBody<"tv-series-recommendations">;
export type MovieImagesResponse = ResponseBody<"movie-images">;
export type TvImagesResponse = ResponseBody<"tv-series-images">;

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

type DetailsByType<T extends MediaType> = T extends "movie" ? Movie : TvShow;

type AppendedByType<T extends MediaType> = T extends "movie"
    ? {
          credits?: MovieCreditsResponse;
          reviews?: MovieReviewsResponse;
          recommendations?: MovieRecommendationsResponse;
          images?: MovieImagesResponse;
          videos?: MovieVideosResponse;
      }
    : {
          credits?: TvCreditsResponse;
          reviews?: TvReviewsResponse;
          recommendations?: TvRecommendationsResponse;
          images?: TvImagesResponse;
          videos?: TvVideosResponse;
      };

export type DetailsWithAppendByType<T extends MediaType> = DetailsByType<T> & AppendedByType<T>;

// --- Multi-search discriminated union ---
export type MultiSearchResult =
    | (MovieResult & { media_type: "movie" })
    | (TvResult & { media_type: "tv" })
    | (PersonResult & { media_type: "person" });
