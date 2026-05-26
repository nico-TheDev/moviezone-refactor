import type { Route } from "./+types/media-details";
import { queryClient } from "@/lib/queryClient";
import { mediaQueries } from "@/queries/media.queries";
import type { MediaType, Movie, TvShow } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import VideoBackground from "@/components/VideoBackground";

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
    const { data: media } = useQuery(mediaQueries.details(mediaType, params.movieId));
    const { data: video } = useQuery(mediaQueries.videos(mediaType, params.movieId));

    return (
        <main className="bg-black text-white">
            <VideoBackground backdropPath={media!.backdrop_path} youtubeId={video?.key} />
            <div className="relative z-10 max-w-7xl mx-auto p-6 -mt-60">
                <h1 className="text-5xl font-display">{getMediaTitle(media!)}</h1>
            </div>
        </main>
    );
}
