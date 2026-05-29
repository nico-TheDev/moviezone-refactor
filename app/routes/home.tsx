import type { Route } from "./+types/home";
import { HeroFeaturedCarousel } from "@/components/HeroFeaturedCarousel";
import { HeroFeaturedSkeleton } from "@/components/HeroFeaturedSkeleton";
import { MediaCarousel } from "@/components/MediaCarousel";
import { MediaCarouselSkeleton } from "@/components/MediaCarouselSkeleton";
import { useHomePageData } from "@/hooks/home.hooks";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

function SectionError({ message }: { message: string }) {
    return <p className="max-w-[90%] mx-auto text-sm text-gray-400">{message}</p>;
}

export default function Home() {
    const { trending, featuredMovies, featuredTvShows } = useHomePageData();

    return (
        <>
            <main className="h-[90vh] mb-40">
                {trending.isPending ? (
                    <HeroFeaturedSkeleton />
                ) : trending.isError ? (
                    <SectionError message="Failed to load featured shows." />
                ) : (
                    <HeroFeaturedCarousel items={trending.data ?? []} mediaType="tv" />
                )}
            </main>

            <section className="my-16">
                {trending.isPending ? (
                    <MediaCarouselSkeleton title="Trending Today" orientation="portrait" />
                ) : trending.isError ? (
                    <SectionError message="Failed to load trending today." />
                ) : (
                    <MediaCarousel
                        mediaData={trending.data ?? []}
                        options={{ loop: true, dragFree: true }}
                        title="Trending Today"
                        orientation="portrait"
                        topLabelEnabled
                    />
                )}
            </section>

            <section className="my-16">
                {featuredMovies.isPending ? (
                    <MediaCarouselSkeleton title="Featured Movies" />
                ) : featuredMovies.isError ? (
                    <SectionError message="Failed to load featured movies." />
                ) : (
                    <MediaCarousel
                        mediaData={featuredMovies.data ?? []}
                        options={{ loop: true, dragFree: true }}
                        title="Featured Movies"
                    />
                )}
            </section>

            <section className="my-16">
                {featuredTvShows.isPending ? (
                    <MediaCarouselSkeleton title="Featured TV Shows" />
                ) : featuredTvShows.isError ? (
                    <SectionError message="Failed to load featured TV shows." />
                ) : (
                    <MediaCarousel
                        mediaData={featuredTvShows.data ?? []}
                        options={{ loop: true, dragFree: true }}
                        title="Featured TV Shows"
                    />
                )}
            </section>
        </>
    );
}
