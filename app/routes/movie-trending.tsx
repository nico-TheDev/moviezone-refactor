import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

export default function MoviesTrending() {
    return (
        <div>
            <div className="text-white bg-red-500">Trending Movies</div>
        </div>
    );
}
