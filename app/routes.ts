import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("components/layout/AppShell.tsx", [
        index("routes/home.tsx"),
        route("media/:type/:movieId", "routes/media-details.tsx"),
        route("list/:mediaType/:category", "routes/list.tsx"),
        route(":type/genre/:slug/:id", "routes/genre-browse.tsx"),
        route("person/:personId", "routes/person.tsx"),
        route("error/:message", "routes/error-page.tsx"),
    ]),
] satisfies RouteConfig;
