import type { Route } from "./+types/media-details";
import { queryClient } from "@/lib/queryClient";
import { mediaQueries } from "@/queries/media.queries";
import type { MediaType, Movie, TvShow } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import VideoBackground from "@/components/VideoBackground";
import { getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import { StarIcon } from "lucide-react";
import GenreList from "@/components/GenreList";
import { useNavigate } from "react-router";
import { API } from "@/constants/api";
import { MediaCarousel } from "@/components/MediaCarousel";

function assertMediaType(value: string): MediaType {
    if (value !== "movie" && value !== "tv") {
        throw new Response(`Unsupported media type: ${value}`, { status: 404 });
    }
    return value;
}

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
    await Promise.all([
        queryClient.ensureQueryData(mediaQueries.details(mediaType, params.movieId)),
        queryClient.ensureQueryData(mediaQueries.videos(mediaType, params.movieId)),
    ]);
    return null;
}

export default function MediaDetails({ params }: Route.ComponentProps) {
    const mediaType = assertMediaType(params.type);
    const {
        data: mediaData,
        isPending,
        isError,
    } = useQuery(mediaQueries.details(mediaType, params.movieId));
    const navigate = useNavigate();

    if (!mediaData || isPending || isError) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <main className="bg-black text-white">
                <VideoBackground
                    backdropPath={mediaData!.backdrop_path}
                    youtubeId={mediaData.videos?.key}>
                    <div className="relative z-10 max-w-[90%] mx-auto p-6 mt-[30rem]">
                        <div className="p-4">
                            <h3 className="text-2xl md:text-4xl font-display mb-4 max-w-2xl">
                                {getTitle(mediaData)}
                            </h3>
                            <p className="flex items-center gap-4 text-sm text-gray-300 font-light mb-4">
                                <span className="inline-flex items-center text-primary gap-2 font-medium">
                                    <StarIcon
                                        size={20}
                                        className="inline-block text-primary"
                                        fill="currentColor"
                                    />
                                    {mediaData.vote_average.toFixed(2)}
                                </span>
                                {<span className="">{getReleaseYear(mediaData)}</span>}
                                {isMovie(mediaData) && mediaData.runtime && (
                                    <span className="">{mediaData.runtime} minutes</span>
                                )}
                            </p>
                            <div className="mb-4">
                                <GenreList
                                    genreIds={mediaData.genres?.map((genre) => genre.id)}
                                    mediaType={mediaType}
                                />
                            </div>
                            <p className="max-w-xl line-clamp-6 text-sm mb-6">
                                {mediaData.overview}
                            </p>

                            <div className="items-center gap-2 justify-between hidden">
                                <button
                                    className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover cursor-pointer inline-flex items-center gap-2"
                                    onClick={() =>
                                        navigate(`/media/${mediaType}/${mediaData.id}`, {
                                            replace: true,
                                        })
                                    }>
                                    See Button
                                </button>
                            </div>
                        </div>
                    </div>
                </VideoBackground>
            </main>

            <section className="my-12">
                <div className="max-w-[85%] mx-auto py-6">
                    <h4 className="text-2xl font-bold mb-8 max-w-2xl flex items-center gap-2">
                        <span className="inline-block w-1 h-10 bg-primary"></span>
                        Cast
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                        {mediaData.credits?.map((cast) => {
                            return (
                                <div
                                    className="flex items-center gap-4 justify-between bg-gray-900/80 p-4 rounded-lg shadow-lg border border-transparent hover:border-primary transition-all duration-300 cursor-pointer"
                                    key={cast.id}>
                                    <img
                                        src={API.IMAGE_PROFILE_URL + cast.profile_path}
                                        alt={cast.name}
                                        className="size-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h6 className="text-lg font-medium">{cast.name}</h6>
                                        <p className="text-sm text-gray-300">{cast.character}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            <div className="max-w-[85%] mx-auto">
                <MediaCarousel
                    mediaData={mediaData.recommendations ?? []}
                    options={{ loop: true, dragFree: true }}
                    title="Recommendations"
                    mediaType={mediaType}
                    setMediaType={() => {}}
                    showMediaTypeSelector={false}
                />
            </div>
        </>
    );
}
