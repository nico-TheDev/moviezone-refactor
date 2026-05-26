import { useFeaturedMoviesAndTVShows } from "@/hooks/tv.hooks";
import type { Route } from "./+types/home";
import { HeroFeaturedCarousel } from "@/components/HeroFeaturedCarousel";
import { MediaCarousel } from "@/components/MediaCarousel";
import { isMovieResult } from "@/utils/media-string-helpers";
import { useTrendingTop10 } from "@/hooks/media.hooks";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

export default function Home() {
    const { data: featuredItems, isPending, isError } = useFeaturedMoviesAndTVShows();
    const {
        data: trendingTop10,
        isPending: isTrendingTop10Pending,
        isError: isTrendingTop10Error,
    } = useTrendingTop10();
    const featuredMovies = featuredItems?.filter((item) => isMovieResult(item));
    const featuredTVShows = featuredItems?.filter((item) => !isMovieResult(item));

    if (isPending) {
        return <main className="p-4 h-[90vh]">Loading...</main>;
    }

    if (isError) {
        return <main className="p-4 h-[90vh]">Error occurred while fetching featured shows.</main>;
    }

    return (
        <main className="h-[90vh]">
            <HeroFeaturedCarousel items={trendingTop10 ?? []} mediaType="tv" />
            <section className="my-16">
                <MediaCarousel
                    mediaData={trendingTop10 ?? []}
                    options={{ loop: true, dragFree: true }}
                    title="Trending Today"
                    orientation="portrait"
                    topLabelEnabled
                />
            </section>
            <section className="my-16">
                <MediaCarousel
                    mediaData={featuredMovies ?? []}
                    options={{ loop: true, dragFree: true }}
                    title="Featured Movies"
                />
            </section>

            <section className="my-16">
                <MediaCarousel
                    mediaData={featuredTVShows ?? []}
                    options={{ loop: true, dragFree: true }}
                    title="Featured TV Shows"
                />
            </section>
        </main>
    );
}
