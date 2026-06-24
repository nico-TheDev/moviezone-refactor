export enum API {
    BFF_TMDB_URL = "/api/tmdb",
    BFF_AUTH_URL = "/api/auth",
    IMAGE_POSTER_URL = "https://image.tmdb.org/t/p/w500",
    IMAGE_BACKDROP_URL = "https://image.tmdb.org/t/p/w1280",
    IMAGE_BACKDROP_HERO_URL = "https://image.tmdb.org/t/p/w1280",
    IMAGE_BACKDROP_FULL_URL = "https://image.tmdb.org/t/p/w1920",
    IMAGE_PROFILE_URL = "https://image.tmdb.org/t/p/w185",
    IMAGE_STILL_URL = "https://image.tmdb.org/t/p/w300",
    IMAGE_LOGO_URL = "https://image.tmdb.org/t/p/w500",
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
