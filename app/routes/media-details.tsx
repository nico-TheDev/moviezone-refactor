import type { Route } from "./+types/media-details";
import { queryClient } from "@/lib/queryClient";
import { mediaQueries } from "@/queries/media.queries";
import type { CastMember, MediaType, Movie, MovieVideo, TvShow } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import VideoBackground from "@/components/VideoBackground";
import { assertMediaType, getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import { StarIcon } from "lucide-react";
import GenreList from "@/components/GenreList";
import { API } from "@/constants/api";
import { MediaCarousel } from "@/components/MediaCarousel";
import { cn } from "@/utils/css-helpers";
import { MediaDetailsSkeleton } from "@/components/MediaDetailsSkeleton";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SeasonScroll } from "@/components/SeasonScroll";
import { TrailerModal } from "@/components/TrailerModal";
import { MediaActionButtons } from "@/components/MediaActionButtons";
import { RatingWidget } from "@/components/RatingWidget";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getAccountStates } from "@/api/account.api";
import { getAllVideos } from "@/api/media.api";
import { useAuthStore } from "@/stores/auth";
import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Link, Navigate, redirect } from "react-router";

function isMovie(media: Movie | TvShow): media is Movie {
    return "title" in media;
}

function getMediaTitle(media: Movie | TvShow): string | undefined {
    return isMovie(media) ? media.title : media.name;
}

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
    try {
        await Promise.all([
            queryClient.ensureQueryData(mediaQueries.details(mediaType, params.movieId)),
            queryClient.ensureQueryData(mediaQueries.videos(mediaType, params.movieId)),
        ]);
    } catch {
        throw redirect("/error/failed-to-load-media");
    }
    return null;
}

function HeroBlock({ children, index }: { children: ReactNode; index: number }) {
    const reduce = useReducedMotion();
    if (reduce) return <>{children}</>;
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.06 }}>
            {children}
        </motion.div>
    );
}

function CastCard({ cast, index }: { cast: CastMember; index: number }) {
    const reduce = useReducedMotion();
    const card = (
        <Link
            to={`/person/${cast.id}`}
            className="flex items-center gap-4 justify-between bg-gray-900/80 p-4 rounded-lg shadow-lg border border-transparent hover:border-primary transition-all duration-300">
            <img
                src={
                    cast.profile_path ? API.IMAGE_PROFILE_URL + cast.profile_path : "/img/logo.png"
                }
                alt={cast.name}
                className="size-12 rounded-full object-cover bg-gray-800"
            />
            <div className="flex-1 min-w-0">
                <h6 className="text-lg font-medium truncate">{cast.name}</h6>
                <p className="text-sm text-gray-300 truncate">{cast.character}</p>
            </div>
        </Link>
    );

    if (reduce) return card;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.04 }}>
            {card}
        </motion.div>
    );
}

export default function MediaDetails({ params }: Route.ComponentProps) {
    const mediaType = assertMediaType(params.type);
    const sessionId = useAuthStore((s) => s.getSessionId());
    const hasSession = useAuthStore((s) => s.hasSession());
    const [trailerOpen, setTrailerOpen] = useState(false);

    const {
        data: mediaData,
        isPending,
        isError,
    } = useQuery(mediaQueries.details(mediaType, params.movieId));

    const { data: allVideos } = useQuery({
        queryKey: ["allVideos", mediaType, params.movieId],
        queryFn: ({ signal }) => getAllVideos(mediaType, params.movieId, signal),
        select: (data) => data.results ?? [],
    });

    const { data: accountStates } = useQuery({
        queryKey: ["accountStates", mediaType, params.movieId, sessionId],
        queryFn: () => getAccountStates(mediaType, params.movieId, sessionId!),
        enabled: hasSession && !!sessionId,
    });

    if (isPending) {
        return <MediaDetailsSkeleton />;
    }

    if (isError || !mediaData) {
        return <Navigate to="/error/failed-to-load-media" replace />;
    }

    const logoImage = mediaData.images?.find((logo) => logo.iso_639_1 === "en");
    const tvShow = !isMovie(mediaData) ? mediaData : null;
    let heroIndex = 0;

    return (
        <>
            <main className="bg-black text-white">
                <VideoBackground
                    backdropPath={mediaData.backdrop_path}
                    youtubeId={mediaData.videos?.key}>
                    <div className="relative z-10 max-w-[90%] mx-auto p-6 mt-[20rem]">
                        <div className="p-4">
                            <HeroBlock index={heroIndex++}>
                                {logoImage ? (
                                    <div className="mb-4 w-50">
                                        <img
                                            src={API.IMAGE_BACKDROP_URL + logoImage.file_path}
                                            alt=""
                                            className={cn(
                                                "w-full h-full object-cover max-h-24",
                                                logoImage.aspect_ratio &&
                                                    `aspect-[${logoImage.aspect_ratio}]`,
                                            )}
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-2xl md:text-4xl font-display mb-4 max-w-2xl">
                                        {getTitle(mediaData)}
                                    </h3>
                                )}
                            </HeroBlock>
                            {isMovie(mediaData) && mediaData.tagline && (
                                <HeroBlock index={heroIndex++}>
                                    <p className="text-gray-400 italic text-sm mb-2">
                                        {mediaData.tagline}
                                    </p>
                                </HeroBlock>
                            )}
                            <HeroBlock index={heroIndex++}>
                                <p className="flex flex-wrap items-center gap-4 text-sm text-gray-300 font-light mb-4">
                                    <span className="inline-flex items-center text-primary gap-2 font-medium">
                                        <StarIcon
                                            size={20}
                                            className="inline-block text-primary"
                                            fill="currentColor"
                                        />
                                        {mediaData.vote_average.toFixed(2)}
                                    </span>
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
                            </HeroBlock>
                            <HeroBlock index={heroIndex++}>
                                <div className="mb-4">
                                    <GenreList
                                        genreIds={mediaData.genres?.map((genre) => genre.id)}
                                        mediaType={mediaType}
                                    />
                                </div>
                            </HeroBlock>
                            <HeroBlock index={heroIndex++}>
                                <p className="max-w-xl line-clamp-5 text-sm mb-6">
                                    {mediaData.overview}
                                </p>
                            </HeroBlock>
                            <HeroBlock index={heroIndex++}>
                                <div className="mb-4">
                                    <RatingWidget
                                        mediaType={mediaType}
                                        mediaId={mediaData.id}
                                        initialRating={accountStates?.rating}
                                    />
                                </div>
                            </HeroBlock>
                            <HeroBlock index={heroIndex++}>
                                <MediaActionButtons
                                    mediaType={mediaType}
                                    mediaId={mediaData.id}
                                    onViewTrailers={() => setTrailerOpen(true)}
                                />
                            </HeroBlock>
                        </div>
                    </div>
                </VideoBackground>
            </main>

            {tvShow?.seasons && <SeasonScroll seasons={tvShow.seasons} />}

            <AnimatedSection className="my-12" delay={0}>
                <div className="max-w-[85%] mx-auto py-6">
                    <h4 className="text-2xl font-bold mb-8 max-w-2xl flex items-center gap-2 text-white">
                        <span className="inline-block w-1 h-10 bg-primary" />
                        Cast
                    </h4>
                    {!mediaData.credits?.length ? (
                        <p className="text-gray-400 text-sm">No cast information available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mediaData.credits.map((cast, index) => (
                                <CastCard key={cast.id} cast={cast} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </AnimatedSection>

            <ReviewsSection reviews={mediaData.reviews ?? []} />

            <AnimatedSection className="max-w-[85%] mx-auto mb-16" delay={0.15}>
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
                    <p className="text-gray-400 text-sm text-center py-8">
                        No recommendations available.
                    </p>
                )}
            </AnimatedSection>

            <TrailerModal
                open={trailerOpen}
                onClose={() => setTrailerOpen(false)}
                videos={(allVideos ?? []) as MovieVideo[]}
            />
        </>
    );
}
