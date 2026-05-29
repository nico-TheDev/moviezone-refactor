import type { Route } from "./+types/home";
import { HeroFeaturedCarousel } from "@/components/HeroFeaturedCarousel";
import { HeroFeaturedSkeleton } from "@/components/HeroFeaturedSkeleton";
import { MediaCarousel } from "@/components/MediaCarousel";
import { useFeaturedMedia, usePopular, useTopRated, useTrendingTop10 } from "@/hooks/media.hooks";
import type { MediaType } from "@/types/tmdb";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

function SectionError({ message }: { message: string }) {
    return <p className="max-w-[90%] mx-auto text-sm text-gray-400">{message}</p>;
}

function FeatureMedia() {
    const featuredMovies = useFeaturedMedia("movie");
    const featuredTvShows = useFeaturedMedia("tv");
    const [mediaType, setMediaType] = useState<MediaType>("movie");

    return (
        <MediaCarousel
            mediaData={
                mediaType === "movie" ? (featuredMovies.data ?? []) : (featuredTvShows.data ?? [])
            }
            options={{ loop: true, dragFree: true }}
            title="Featured Today"
            orientation="landscape"
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={mediaType === "movie" ? featuredMovies.isPending : featuredTvShows.isPending}
        />
    );
}

function TrendingMedia() {
    const trendingMovies = useTrendingTop10("movie");
    const trendingTvShows = useTrendingTop10("tv");
    const [mediaType, setMediaType] = useState<MediaType>("movie");

    return (
        <MediaCarousel
            mediaData={
                mediaType === "movie" ? (trendingMovies.data ?? []) : (trendingTvShows.data ?? [])
            }
            options={{ loop: true, dragFree: true }}
            title="Top 10"
            orientation="portrait"
            topLabelEnabled
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={mediaType === "movie" ? trendingMovies.isPending : trendingTvShows.isPending}
        />
    );
}

function TopRatedMedia() {
    const topRatedMovies = useTopRated("movie");
    const topRatedTvShows = useTopRated("tv");
    const [mediaType, setMediaType] = useState<MediaType>("movie");

    return (
        <MediaCarousel
            mediaData={
                mediaType === "movie" ? (topRatedMovies.data ?? []) : (topRatedTvShows.data ?? [])
            }
            options={{ loop: true, dragFree: true }}
            title="Top Rated"
            orientation="landscape"
            topLabelEnabled
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={mediaType === "movie" ? topRatedMovies.isPending : topRatedTvShows.isPending}
        />
    );
}

function PopularMedia() {
    const popularMovies = usePopular("movie");
    const popularTvShows = usePopular("tv");
    const [mediaType, setMediaType] = useState<MediaType>("movie");

    return (
        <MediaCarousel
            mediaData={
                mediaType === "movie" ? (popularMovies.data ?? []) : (popularTvShows.data ?? [])
            }
            options={{ loop: true, dragFree: true }}
            title="Popular"
            orientation="landscape"
            topLabelEnabled
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={mediaType === "movie" ? popularMovies.isPending : popularTvShows.isPending}
        />
    );
}

export default function Home() {
    const trendingMovies = useTrendingTop10("movie");
    return (
        <>
            <main className="h-[90vh] mb-40">
                {trendingMovies.isPending ? (
                    <HeroFeaturedSkeleton />
                ) : trendingMovies.isError ? (
                    <SectionError message="Failed to load featured shows." />
                ) : (
                    <HeroFeaturedCarousel items={trendingMovies.data ?? []} mediaType="movie" />
                )}
            </main>

            <section className="my-16">
                <TrendingMedia />
            </section>
            <section className="my-16">
                <FeatureMedia />
            </section>
            <section className="my-16">
                <TopRatedMedia />
            </section>
            <section className="my-16">
                <PopularMedia />
            </section>
        </>
    );
}
