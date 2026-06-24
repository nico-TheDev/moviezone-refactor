export function getServerEnv() {
    const tmdbBearer =
        process.env.TMDB_BEARER_TOKEN ?? process.env.VITE_TMDB_BEARER_TOKEN ?? "";
    const tmdbApiKey = process.env.TMDB_API_KEY ?? process.env.VITE_TMDB_API_KEY ?? "";

    return {
        tmdbBearer,
        tmdbApiKey,
        port: Number(process.env.PORT ?? 3001),
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
        nodeEnv: process.env.NODE_ENV ?? "development",
        clientDir: process.env.CLIENT_DIR ?? "build/client",
    };
}

export function assertServerEnv() {
    const env = getServerEnv();
    if (!env.tmdbBearer) {
        throw new Error("TMDB_BEARER_TOKEN is required for the BFF server");
    }
    return env;
}
