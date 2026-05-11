import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("components/layout/Nav.tsx", [
        index("routes/home.tsx"),
        route("movies/trending", "routes/movie-trending.tsx"),
    ]),
] satisfies RouteConfig;
