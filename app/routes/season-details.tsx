import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { ErrorState } from "@/components/ui/ErrorState";
import { Rating } from "@/components/ui/Rating";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { API } from "@/constants/api";
import { queryClient } from "@/lib/queryClient";
import { mediaQueries } from "@/queries/media.queries";
import { seasonQueries } from "@/queries/season.queries";
import type { SeasonEpisode } from "@/types/tmdb";
import type { Route } from "./+types/season-details";

function EpisodeRow({ episode, index }: { episode: SeasonEpisode; index: number }) {
    return (
        <Reveal when="inView" index={index}>
            <article className="flex flex-col sm:flex-row gap-4 rounded-xl border border-line bg-surface p-4">
                <div className="w-full sm:w-40 shrink-0 aspect-video rounded-md overflow-hidden bg-surface-muted">
                    {episode.still_path ? (
                        <img
                            src={`${API.IMAGE_STILL_URL}${episode.still_path}`}
                            alt={episode.name ?? `Episode ${episode.episode_number}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-subtle text-xs">
                            E{episode.episode_number}
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                        <h3 className="font-medium text-ink">
                            <span className="text-ink-subtle tabular-nums">
                                {episode.episode_number}.
                            </span>{" "}
                            {episode.name}
                        </h3>
                        {episode.vote_average > 0 && (
                            <Rating
                                value={episode.vote_average}
                                size={12}
                                className="text-xs text-ink-muted"
                            />
                        )}
                    </div>
                    <p className="text-xs text-ink-subtle mb-2">
                        {episode.air_date && <span>{episode.air_date}</span>}
                        {episode.air_date && episode.runtime > 0 && <span> · </span>}
                        {episode.runtime > 0 && <span>{episode.runtime} min</span>}
                    </p>
                    {episode.overview && (
                        <p className="text-sm text-ink-muted leading-relaxed line-clamp-3">
                            {episode.overview}
                        </p>
                    )}
                </div>
            </article>
        </Reveal>
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
        queryClient.ensureQueryData(seasonQueries.details(params.showId, params.seasonNumber)),
        queryClient.ensureQueryData(mediaQueries.details("tv", params.showId)),
    ]);
    return null;
}

export default function SeasonDetails({ params }: Route.ComponentProps) {
    const {
        data: season,
        isPending,
        isError,
        error,
        refetch,
    } = useQuery(seasonQueries.details(params.showId, params.seasonNumber));
    const { data: show } = useQuery(mediaQueries.details("tv", params.showId));

    if (isPending) {
        return (
            <main className="max-w-[85%] mx-auto py-24 text-ink">
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
                    {["episode-1", "episode-2", "episode-3", "episode-4"].map((key) => (
                        <Skeleton key={key} className="h-28 w-full rounded-xl" />
                    ))}
                </div>
            </main>
        );
    }

    if (isError || !season) {
        return (
            <main className="min-h-screen bg-canvas py-24">
                <ErrorState title="Failed to load season" error={error} onRetry={() => refetch()} />
            </main>
        );
    }

    const showName = show && "name" in show ? show.name : "Show";
    const episodes = season.episodes ?? [];

    return (
        <main className="max-w-[85%] mx-auto py-24 text-ink">
            <Link
                to={`/media/tv/${params.showId}`}
                viewTransition
                className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary-text transition-colors mb-8"
            >
                <ArrowLeft size={16} />
                Back to {showName}
            </Link>

            <Reveal>
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    <div className="w-40 shrink-0 aspect-[2/3] rounded-md overflow-hidden bg-surface-muted">
                        {season.poster_path ? (
                            <img
                                src={`${API.IMAGE_POSTER_URL}${season.poster_path}`}
                                alt={season.name ?? `Season ${season.season_number}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-subtle">
                                S{season.season_number}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-balance mb-2">
                            {season.name ?? `Season ${season.season_number}`}
                        </h1>
                        <p className="text-sm text-ink-muted mb-4">
                            {season.air_date && <span>{season.air_date}</span>}
                            {season.air_date && episodes.length > 0 && <span> · </span>}
                            {episodes.length > 0 && <span>{episodes.length} episodes</span>}
                        </p>
                        {season.overview && (
                            <p className="text-sm text-ink-muted leading-relaxed">
                                {season.overview}
                            </p>
                        )}
                    </div>
                </div>
            </Reveal>

            <Reveal delay={0.08}>
                <SectionHeading className="mb-6">Episodes</SectionHeading>
                {episodes.length === 0 ? (
                    <p className="text-ink-muted text-sm">No episodes available.</p>
                ) : (
                    <div className="space-y-4">
                        {episodes.map((episode, index) => (
                            <EpisodeRow key={episode.id} episode={episode} index={index} />
                        ))}
                    </div>
                )}
            </Reveal>
        </main>
    );
}
