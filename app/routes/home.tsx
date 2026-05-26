import { useFeaturedTvShows } from "@/hooks/tv.hooks";
import type { Route } from "./+types/home";
import { HeroFeaturedCarousel } from "@/components/HeroFeaturedCarousel";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

export default function Home() {
    const { data, isPending, isError } = useFeaturedTvShows();

    if (isPending) {
        return <main className="p-4 h-[90vh]">Loading...</main>;
    }

    if (isError) {
        return <main className="p-4 h-[90vh]">Error occurred while fetching featured shows.</main>;
    }

    const featuredItems = data.results.slice(0, 7) || [];

    return (
        <main className="h-[90vh]">
            <HeroFeaturedCarousel items={featuredItems} mediaType="tv" />
        </main>
    );
}
