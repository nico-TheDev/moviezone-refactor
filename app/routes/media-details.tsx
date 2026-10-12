import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { getAccountStates } from "@/api/account.api";
import { getAllVideos } from "@/api/media.api";
import GenreList from "@/components/GenreList";
import { MediaActionButtons } from "@/components/MediaActionButtons";
import { MediaCarousel } from "@/components/MediaCarousel";
import { MediaDetailsSkeleton } from "@/components/MediaDetailsSkeleton";
import { RatingWidget } from "@/components/RatingWidget";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SeasonScroll } from "@/components/SeasonScroll";
import { TrailerModal } from "@/components/TrailerModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { Rating } from "@/components/ui/Rating";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import VideoBackground from "@/components/VideoBackground";
import { API } from "@/constants/api";
import { queryClient } from "@/lib/queryClient";
import { mediaQueries } from "@/queries/media.queries";
import { useAuthStore } from "@/stores/auth";
import type { CastMember, Movie, MovieVideo, TvShow } from "@/types/tmdb";
import { assertMediaType, getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import type { Route } from "./+types/media-details";

function isMovie(media: Movie | TvShow): media is Movie {
    return "title" in media;
}

function getMediaTitle(media: Movie | TvShow): string | undefined {
    return isMovie(media) ? media.title : media.name;
}

/**
 * The first viewport of this route is a full-bleed backdrop, so the nav floats
 * light-on-dark here instead of taking the canvas text colour.
 */
export const handle = { navTone: "onImage" };

export function meta({ params }: Route.MetaArgs) {
    const mediaType = assertMediaType(params.type);
    const media = queryClient.getQueryData(
        mediaQueries.details(mediaType, params.movieId).queryKey,
    );
    const title = media ? getMediaTitle(media) : undefined;
    return [
        { title: title ? `${title} | MovieZone` : "MovieZone" },
        { name: "description", content: media?.overview ?? "Movie details on MovieZone." },
    ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const mediaType = assertMediaType(params.type);
    await queryClient.ensureQueryData(mediaQueries.details(mediaType, params.movieId));
    return null;
}

function CastCard({ cast, index }: { cast: CastMember; index: number }) {
    return (
        <Reveal when="inView" index={index}>
            <Link
                to={`/person/${cast.id}`}
                viewTransition
                className="group/cast flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-primary"
            >
                <img
                    src={
                        cast.profile_path
                            ? API.IMAGE_PROFILE_URL + cast.profile_path
                            : "/img/logo.png"
                    }
                    alt={cast.name}
                    loading="lazy"
                    className="size-12 shrink-0 rounded-full object-cover bg-surface-muted"
                />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate transition-colors group-hover/cast:text-primary-text">
                        {cast.name}
                    </p>
                    <p className="text-sm text-ink-muted truncate">{cast.character}</p>
                </div>
            </Link>
        </Reveal>
    );
}

export default function MediaDetails({ params }: Route.ComponentProps) {
    const mediaType = assertMediaType(params.type);
    const hasSession = useAuthStore((s) => s.hasSession());
    const [trailerOpen, setTrailerOpen] = useState(false);

    const {
        data: mediaData,
        isPending,
        isError,
        error,
        refetch,
    } = useQuery(mediaQueries.details(mediaType, params.movieId));

    const { data: allVideos } = useQuery({
        queryKey: ["allVideos", mediaType, params.movieId],
        queryFn: ({ signal }) => getAllVideos(mediaType, params.movieId, signal),
        select: (data) => data.results ?? [],
        enabled: trailerOpen,
    });

    const { data: accountStates } = useQuery({
        queryKey: ["accountStates", mediaType, params.movieId],
        queryFn: () => getAccountStates(mediaType, params.movieId),
        enabled: hasSession,
    });

    if (isPending) {
        return <MediaDetailsSkeleton />;
    }

    if (isError || !mediaData) {
        return (
            <main className="min-h-screen bg-canvas">
                <ErrorState title="Failed to load media" error={error} onRetry={() => refetch()} />
            </main>
        );
    }

    const logoImage = mediaData.images?.find((logo) => logo.iso_639_1 === "en");
    const tvShow = !isMovie(mediaData) ? mediaData : null;
    let heroIndex = 0;

    return (
        <>
            <main className="bg-scrim text-white">
                <VideoBackground
                    backdropPath={mediaData.backdrop_path}
                    youtubeId={mediaData.videos?.key}
                >
                    <div className="relative z-10 max-w-[85%] mx-auto mt-32 sm:mt-48 md:mt-64 lg:mt-80">
                        <div className="py-4">
                            <Reveal delay={heroIndex++ * 0.06}>
                                {logoImage ? (
                                    <h1 className="mb-4 w-50">
                                        <img
                                            src={API.IMAGE_LOGO_URL + logoImage.file_path}
                                            alt={getTitle(mediaData) ?? ""}
                                            className="max-h-40 object-cover"
                                            style={{ aspectRatio: logoImage.aspect_ratio }}
                                        />
                                    </h1>
                                ) : (
                                    <h1 className="text-3xl md:text-5xl font-display text-balance mb-4 max-w-2xl">
                                        {getTitle(mediaData)}
                                    </h1>
                                )}
                            </Reveal>
                            {isMovie(mediaData) && mediaData.tagline && (
                                <Reveal delay={heroIndex++ * 0.06}>
                                    <p className="text-white/70 italic text-sm mb-2">
                                        {mediaData.tagline}
                                    </p>
                                </Reveal>
                            )}
                            <Reveal delay={heroIndex++ * 0.06}>
                                <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85 mb-4">
                                    <Rating
                                        value={mediaData.vote_average}
                                        size={18}
                                        className="font-medium text-white"
                                    />
                                    <span>{getReleaseYear(mediaData)}</span>
                                    {isMovie(mediaData) && mediaData.runtime && (
                                        <span>{mediaData.runtime} min</span>
                                    )}
                                    {tvShow && (
                                        <>
                                            <span>
                                                {tvShow.number_of_seasons} seasons ·{" "}
                                                {tvShow.number_of_episodes} episodes
                                            </span>
                                            {tvShow.created_by && tvShow.created_by.length > 0 && (
                                                <span>
                                                    Created by{" "}
                                                    {tvShow.created_by
                                                        .map((c) => c.name)
                                                        .join(", ")}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </p>
                            </Reveal>
                            <Reveal delay={heroIndex++ * 0.06}>
                                <div className="mb-4">
                                    <GenreList
                                        genreIds={mediaData.genres?.map((genre) => genre.id)}
                                        mediaType={mediaType}
                                    />
                                </div>
                            </Reveal>
                            <Reveal delay={heroIndex++ * 0.06}>
                                <p className="max-w-xl line-clamp-5 text-sm leading-relaxed text-white/90 mb-6">
                                    {mediaData.overview}
                                </p>
                            </Reveal>
                            <Reveal delay={heroIndex++ * 0.06}>
                                <div className="mb-4">
                                    <RatingWidget
                                        mediaType={mediaType}
                                        mediaId={mediaData.id}
                                        initialRating={accountStates?.rating}
                                    />
                                </div>
                            </Reveal>
                            <Reveal delay={heroIndex++ * 0.06}>
                                <MediaActionButtons
                                    mediaType={mediaType}
                                    mediaId={mediaData.id}
                                    onViewTrailers={() => setTrailerOpen(true)}
                                />
                            </Reveal>
                        </div>
                    </div>
                </VideoBackground>
            </main>

            {tvShow?.seasons && <SeasonScroll seasons={tvShow.seasons} showId={tvShow.id} />}

            <Reveal as="section" when="inView" className="my-12">
                <div className="max-w-[85%] mx-auto py-6">
                    <SectionHeading className="mb-8">Cast</SectionHeading>
                    {!mediaData.credits?.length ? (
                        <p className="text-ink-muted text-sm">No cast information available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mediaData.credits.map((cast, index) => (
                                <CastCard key={cast.id} cast={cast} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </Reveal>

            <ReviewsSection reviews={mediaData.reviews ?? []} />

            <Reveal as="section" when="inView" className="max-w-[85%] mx-auto my-12 py-6">
                {(mediaData.recommendations?.length ?? 0) > 0 ? (
                    <MediaCarousel
                        mediaData={mediaData.recommendations ?? []}
                        options={{ loop: true, dragFree: true }}
                        title="Recommendations"
                        mediaType={mediaType}
                        setMediaType={() => {}}
                        showMediaTypeSelector={false}
                    />
                ) : (
                    <p className="text-ink-muted text-sm text-center py-8">
                        No recommendations available.
                    </p>
                )}
            </Reveal>

            <TrailerModal
                open={trailerOpen}
                onClose={() => setTrailerOpen(false)}
                videos={(allVideos ?? []) as MovieVideo[]}
            />
        </>
    );
}
