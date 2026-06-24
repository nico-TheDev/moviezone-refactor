export enum API {
    BASE_URL = "https://api.themoviedb.org/3",
    IMAGE_POSTER_URL = "https://image.tmdb.org/t/p/w500",
    IMAGE_BACKDROP_URL = "https://image.tmdb.org/t/p/w1920",
    IMAGE_PROFILE_URL = "https://image.tmdb.org/t/p/w185",
    API_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN,
    API_KEY = import.meta.env.VITE_TMDB_API_KEY,
    TMDB_AUTH_URL = "https://www.themoviedb.org/authenticate",
}

export function getAppUrl(): string {
    const configured =
        typeof import.meta.env.VITE_APP_URL === "string"
            ? import.meta.env.VITE_APP_URL.trim()
            : "";
    const origin =
        typeof window !== "undefined" ? window.location.origin : configured;
    return (configured || origin).replace(/\/$/, "");
}
