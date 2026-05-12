import { API } from "@/constants/api";
import type { GenreListResponse, MovieResult, PaginatedResponse } from "@/types/tmdb";

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
