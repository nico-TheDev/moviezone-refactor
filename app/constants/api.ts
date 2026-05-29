export enum API {
    BASE_URL = "https://api.themoviedb.org/3",
    IMAGE_POSTER_URL = "https://image.tmdb.org/t/p/w500",
    IMAGE_BACKDROP_URL = "https://image.tmdb.org/t/p/w1920",
    IMAGE_PROFILE_URL = "https://image.tmdb.org/t/p/w185",
    API_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN,
}
