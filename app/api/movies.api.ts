import { API } from "@/constants/api";
import type {
    GenreListResponse,
    Movie,
    MovieResult,
    MovieVideosResponse,
    PaginatedResponse,
} from "@/types/tmdb";

export const getFeaturedMovies = async (): Promise<PaginatedResponse<MovieResult>> => {
    const response = await fetch(`${API.BASE_URL}/discover/movie?sort_by=popularity.desc`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${API.API_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch featured movies");
    }

    return response.json();
};

export const getGenresList = async (): Promise<GenreListResponse> => {
    const response = await fetch(`${API.BASE_URL}/genre/movie/list?language=en'`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${API.API_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch genres list");
    }

    return response.json();
};

export const getMovieDetails = async (movieId: string): Promise<Movie> => {
    const response = await fetch(`${API.BASE_URL}/movie/${movieId}`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${API.API_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch movie details");
    }

    return response.json();
};

export const getMovieVideos = async (movieId: string): Promise<MovieVideosResponse> => {
    const response = await fetch(`${API.BASE_URL}/movie/${movieId}/videos`, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${API.API_TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch movie videos");
    }

    return response.json();
};
