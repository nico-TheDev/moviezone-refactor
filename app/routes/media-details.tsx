import type { Route } from "./+types/media-details";
import { queryClient } from "@/lib/queryClient";
import { moviesQueries } from "@/queries/movies.queries";
import { useMovieDetails, useMovieVideos } from "@/hooks/movies.hooks";
import VideoBackground from "@/components/VideoBackground";

export function meta({ params }: Route.MetaArgs) {
    const movie = queryClient.getQueryData(
        moviesQueries.movieDetails(params.movieId).queryKey,
    );
    return [
        { title: movie?.title ? `${movie.title} | MovieZone` : "MovieZone" },
        { name: "description", content: movie?.overview ?? "Movie details on MovieZone." },
    ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    await Promise.all([
        queryClient.ensureQueryData(moviesQueries.movieDetails(params.movieId)),
        queryClient.ensureQueryData(moviesQueries.movieVideos(params.movieId)),
    ]);
    return null;
}

export default function MediaDetails({ params }: Route.ComponentProps) {
    const { data: movie } = useMovieDetails(params.movieId);
    const { data: video } = useMovieVideos(params.movieId);

    return (
        <main className="relative min-h-screen overflow-hidden">
            <VideoBackground backdropPath={movie!.backdrop_path} youtubeId={video?.key} />
            <div className="relative z-10 max-w-7xl mx-auto pt-[60vh] p-6 text-white">
                <h1 className="text-5xl font-display">{movie!.title}</h1>
            </div>
        </main>
    );
}
