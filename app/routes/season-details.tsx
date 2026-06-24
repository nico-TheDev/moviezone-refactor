import type { Route } from "./+types/season-details";
import { API } from "@/constants/api";
import { queryClient } from "@/lib/queryClient";
import { mediaQueries } from "@/queries/media.queries";
import { seasonQueries } from "@/queries/season.queries";
import type { SeasonEpisode } from "@/types/tmdb";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, StarIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Link } from "react-router";

function EpisodeRow({ episode, index }: { episode: SeasonEpisode; index: number }) {
    const reduce = useReducedMotion();
    const row = (
        <article className="flex flex-col sm:flex-row gap-4 bg-gray-900/80 p-4 rounded-lg border border-white/5">
            <div className="w-full sm:w-36 shrink-0 aspect-video rounded-md overflow-hidden bg-gray-800">
                {episode.still_path ? (
                    <img
                        src={`${API.IMAGE_STILL_URL}${episode.still_path}`}
                        alt={episode.name ?? `Episode ${episode.episode_number}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        E{episode.episode_number}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h6 className="text-sm font-medium text-white">
                        {episode.episode_number}. {episode.name}
                    </h6>
                    {episode.vote_average > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <StarIcon size={12} fill="currentColor" />
                            {episode.vote_average.toFixed(1)}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mb-2">
                    {episode.air_date && <span>{episode.air_date}</span>}
                    {episode.air_date && episode.runtime > 0 && <span> · </span>}
                    {episode.runtime > 0 && <span>{episode.runtime} min</span>}
                </p>
                {episode.overview && (
                    <p className="text-sm text-gray-300 line-clamp-3">{episode.overview}</p>
                )}
            </div>
        </article>
    );

    if (reduce) return row;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.04 }}>
            {row}
        </motion.div>
    );
}

export function meta({ params }: Route.MetaArgs) {
    const season = queryClient.getQueryData(
        seasonQueries.details(params.showId, params.seasonNumber).queryKey,
    );
    const show = queryClient.getQueryData(mediaQueries.details("tv", params.showId).queryKey);
    const seasonName = season?.name ?? `Season ${params.seasonNumber}`;
    const showName = show && "name" in show ? show.name : undefined;
    return [
        {
            title: showName
                ? `${seasonName} | ${showName} | MovieZone`
                : `${seasonName} | MovieZone`,
        },
    ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    await Promise.all([
        queryClient.ensureQueryData(
            seasonQueries.details(params.showId, params.seasonNumber),
        ),
        queryClient.ensureQueryData(mediaQueries.details("tv", params.showId)),
    ]);
    return null;
}

export default function SeasonDetails({ params }: Route.ComponentProps) {
    const { data: season, isPending, isError, error, refetch } = useQuery(
        seasonQueries.details(params.showId, params.seasonNumber),
    );
    const { data: show } = useQuery(mediaQueries.details("tv", params.showId));

    if (isPending) {
        return (
            <main className="max-w-[85%] mx-auto py-24 text-white">
                <Skeleton className="h-6 w-40 mb-8" />
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <Skeleton className="w-40 aspect-[2/3] rounded-md shrink-0" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-lg" />
                    ))}
                </div>
            </main>
        );
    }

    if (isError || !season) {
        return (
            <main className="min-h-screen bg-gray-950 py-24">
                <ErrorState
                    title="Failed to load season"
                    error={error}
                    onRetry={() => refetch()}
                />
            </main>
        );
    }

    const showName = show && "name" in show ? show.name : "Show";
    const episodes = season.episodes ?? [];

    return (
        <main className="max-w-[85%] mx-auto py-24 text-white">
            <Link
                to={`/media/tv/${params.showId}`}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-8">
                <ArrowLeft size={16} />
                Back to {showName}
            </Link>

            <AnimatedSection delay={0}>
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="w-40 shrink-0 aspect-[2/3] rounded-md overflow-hidden bg-gray-900">
                        {season.poster_path ? (
                            <img
                                src={`${API.IMAGE_POSTER_URL}${season.poster_path}`}
                                alt={season.name ?? `Season ${season.season_number}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                S{season.season_number}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">
                            {season.name ?? `Season ${season.season_number}`}
                        </h1>
                        <p className="text-sm text-gray-400 mb-4">
                            {season.air_date && <span>{season.air_date}</span>}
                            {season.air_date && episodes.length > 0 && <span> · </span>}
                            {episodes.length > 0 && (
                                <span>{episodes.length} episodes</span>
                            )}
                        </p>
                        {season.overview && (
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {season.overview}
                            </p>
                        )}
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection delay={0.08}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="inline-block w-1 h-8 bg-primary" />
                    Episodes
                </h2>
                {episodes.length === 0 ? (
                    <p className="text-gray-400 text-sm">No episodes available.</p>
                ) : (
                    <div className="space-y-4">
                        {episodes.map((episode, index) => (
                            <EpisodeRow key={episode.id} episode={episode} index={index} />
                        ))}
                    </div>
                )}
            </AnimatedSection>
        </main>
    );
}
