import type { Route } from "./+types/home";
import { HeroFeaturedCarousel } from "@/components/HeroFeaturedCarousel";
import { HeroFeaturedSkeleton } from "@/components/HeroFeaturedSkeleton";
import { MediaCarousel } from "@/components/MediaCarousel";
import { mediaQueries } from "@/queries/media.queries";
import type { MediaType } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { SectionError } from "@/components/ui/SectionError";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

function FeatureMedia() {
    const [mediaType, setMediaType] = useState<MediaType>("movie");
    const featuredMovies = useQuery({
        ...mediaQueries.featured("movie"),
        enabled: mediaType === "movie",
    });
    const featuredTvShows = useQuery({
        ...mediaQueries.featured("tv"),
        enabled: mediaType === "tv",
    });

    const activeQuery = mediaType === "movie" ? featuredMovies : featuredTvShows;

    return (
        <MediaCarousel
            mediaData={activeQuery.data ?? []}
            options={{ loop: true, dragFree: true }}
            title="Featured Today"
            orientation="landscape"
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={activeQuery.isPending}
            isError={activeQuery.isError}
            error={activeQuery.error}
            onRetry={() => activeQuery.refetch()}
        />
    );
}

function TrendingMedia() {
    const [mediaType, setMediaType] = useState<MediaType>("movie");
    const trendingMovies = useQuery({
        ...mediaQueries.top10Trending("movie"),
        enabled: mediaType === "movie",
    });
    const trendingTvShows = useQuery({
        ...mediaQueries.top10Trending("tv"),
        enabled: mediaType === "tv",
    });

    const activeQuery = mediaType === "movie" ? trendingMovies : trendingTvShows;

    return (
        <MediaCarousel
            mediaData={activeQuery.data ?? []}
            options={{ loop: true, dragFree: true }}
            title="Top 10"
            orientation="portrait"
            topLabelEnabled
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={activeQuery.isPending}
            isError={activeQuery.isError}
            error={activeQuery.error}
            onRetry={() => activeQuery.refetch()}
        />
    );
}

function TopRatedMedia() {
    const [mediaType, setMediaType] = useState<MediaType>("tv");
    const topRatedMovies = useQuery({
        ...mediaQueries.topRated("movie"),
        enabled: mediaType === "movie",
    });
    const topRatedTvShows = useQuery({
        ...mediaQueries.topRated("tv"),
        enabled: mediaType === "tv",
    });

    const activeQuery = mediaType === "movie" ? topRatedMovies : topRatedTvShows;

    return (
        <MediaCarousel
            mediaData={activeQuery.data ?? []}
            options={{ loop: true, dragFree: true }}
            title="Top Rated"
            orientation="landscape"
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={activeQuery.isPending}
            isError={activeQuery.isError}
            error={activeQuery.error}
            onRetry={() => activeQuery.refetch()}
        />
    );
}

function PopularMedia() {
    const [mediaType, setMediaType] = useState<MediaType>("movie");
    const popularMovies = useQuery({
        ...mediaQueries.popular("movie"),
        enabled: mediaType === "movie",
    });
    const popularTvShows = useQuery({
        ...mediaQueries.popular("tv"),
        enabled: mediaType === "tv",
    });

    const activeQuery = mediaType === "movie" ? popularMovies : popularTvShows;

    return (
        <MediaCarousel
            mediaData={activeQuery.data ?? []}
            options={{ loop: true, dragFree: true }}
            title="Popular"
            orientation="landscape"
            mediaType={mediaType}
            setMediaType={setMediaType}
            isLoading={activeQuery.isPending}
            isError={activeQuery.isError}
            error={activeQuery.error}
            onRetry={() => activeQuery.refetch()}
        />
    );
}

export default function Home() {
    const trendingMovies = useQuery(mediaQueries.top10Trending("movie"));
    return (
        <>
            <main className="h-screen mb-16 md:mb-24">
                {trendingMovies.isPending ? (
                    <HeroFeaturedSkeleton />
                ) : trendingMovies.isError ? (
                    <div className="max-w-[90%] mx-auto h-full flex items-center justify-center">
                        <SectionError
                            message="Failed to load featured shows."
                            error={trendingMovies.error}
                            onRetry={() => trendingMovies.refetch()}
                        />
                    </div>
                ) : (
                    <HeroFeaturedCarousel items={trendingMovies.data ?? []} mediaType="movie" />
                )}
            </main>

            <div className="max-w-[85%] mx-auto">
                {[
                    { key: "trending", content: <TrendingMedia /> },
                    { key: "featured", content: <FeatureMedia /> },
                    { key: "toprated", content: <TopRatedMedia /> },
                    { key: "popular", content: <PopularMedia /> },
                ].map(({ key, content }, index) => (
                    <motion.section
                        key={key}
                        className="my-16"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}>
                        {content}
                    </motion.section>
                ))}
            </div>
        </>
    );
}
