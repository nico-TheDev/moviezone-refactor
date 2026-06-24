import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("/api/tmdb/discover/movie", () =>
        HttpResponse.json({
            page: 1,
            results: [{ id: 1, title: "Test Movie", poster_path: "/x.jpg", vote_average: 8 }],
            total_pages: 1,
            total_results: 1,
        }),
    ),
    http.get("/api/tmdb/search/multi", () =>
        HttpResponse.json({
            page: 1,
            results: [
                {
                    id: 550,
                    media_type: "movie",
                    title: "Fight Club",
                    poster_path: "/p.jpg",
                },
            ],
            total_pages: 1,
            total_results: 1,
        }),
    ),
    http.get("/api/auth/request-token", () =>
        HttpResponse.json({ request_token: "test-token" }),
    ),
    http.post("/api/auth/guest", () => HttpResponse.json({ success: true })),
    http.post("/api/auth/session", () =>
        HttpResponse.json({
            account: { id: 1, username: "testuser", name: "Test User" },
        }),
    ),
];
