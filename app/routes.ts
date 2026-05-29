import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("components/layout/AppShell.tsx", [
        index("routes/home.tsx"),
        route("movies/trending", "routes/movie-trending.tsx"),
        route("media/:type/:movieId", "routes/media-details.tsx"),
    ]),
] satisfies RouteConfig;
