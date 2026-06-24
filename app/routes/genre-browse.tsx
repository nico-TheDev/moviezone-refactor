import type { Route } from "./+types/genre-browse";
import { GenreMultiSelect } from "@/components/GenreMultiSelect";
import { MediaGrid } from "@/components/MediaGrid";
import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";
import { AnimatedPageHeader } from "@/components/ui/AnimatedPageHeader";
import { listQueries } from "@/queries/list.queries";
import { mediaQueries } from "@/queries/media.queries";
import type { MediaType } from "@/types/tmdb";
import {
    buildGenreBrowseUrl,
    formatGenreTitle,
    mapGenreIdsAcrossMediaType,
    parseGenreIds,
} from "@/utils/genre-helpers";
import { assertMediaType } from "@/utils/media-string-helpers";
import { cn } from "@/utils/css-helpers";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function meta({ params }: Route.MetaArgs) {
    return [{ title: `Genre | MovieZone` }];
}

export default function GenreBrowsePage({ params }: Route.ComponentProps) {
    const navigate = useNavigate();
    const mediaType = assertMediaType(params.type);
    const [searchParams] = useSearchParams();
    const genreIds = useMemo(
        () => parseGenreIds(params.id, searchParams.get("genres")),
        [params.id, searchParams],
    );
    const genreKey = genreIds.join(",");

    const { data: genres, isPending: genresPending } = useQuery(mediaQueries.genres(mediaType));
    const { data: movieGenres } = useQuery(mediaQueries.genres("movie"));
    const { data: tvGenres } = useQuery(mediaQueries.genres("tv"));

    const genreTitle = formatGenreTitle(genreIds, genres ?? new Map(), params.slug);

    const { data, isPending, isError, error, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteQuery({
            ...listQueries.genreInfinite(mediaType, genreIds),
            enabled: genreIds.length > 0,
        });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [mediaType, genreKey]);

    const items = useMemo(
        () =>
            data?.pages.flatMap((page) =>
                page.results.map((media) => ({ media, mediaType })),
            ) ?? [],
        [data, mediaType],
    );

    const navigateWithGenres = (nextMediaType: MediaType, nextGenreIds: number[]) => {
        const names =
            nextMediaType === "movie"
                ? (movieGenres ?? new Map())
                : (tvGenres ?? new Map());
        navigate(buildGenreBrowseUrl(nextMediaType, nextGenreIds, names));
    };

    const handleGenreChange = (nextIds: number[]) => {
        navigateWithGenres(mediaType, nextIds);
    };

    const handleMediaTypeChange = (nextMediaType: MediaType) => {
        if (nextMediaType === mediaType) return;
        const fromNames = mediaType === "movie" ? (movieGenres ?? new Map()) : (tvGenres ?? new Map());
        const toGenres = nextMediaType === "movie" ? (movieGenres ?? new Map()) : (tvGenres ?? new Map());
        const mappedIds = mapGenreIdsAcrossMediaType(genreIds, fromNames, toGenres);
        navigateWithGenres(nextMediaType, mappedIds);
    };

    return (
        <main className="max-w-[85%] mx-auto py-24">
            <AnimatedPageHeader className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 bg-primary block h-10" />
                    {genreTitle}
                </h1>
            </AnimatedPageHeader>

            <AnimatedFadeIn
                className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-8"
                delay={0.06}>
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Type</span>
                    <div className="flex items-center border rounded-md border-primary w-fit">
                        <button
                            type="button"
                            className={cn(
                                "px-4 py-2 text-sm transition-all duration-300 border-r border-primary",
                                mediaType === "movie"
                                    ? "bg-primary text-white"
                                    : "text-primary hover:bg-primary hover:text-white",
                            )}
                            onClick={() => handleMediaTypeChange("movie")}>
                            Movies
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "px-4 py-2 text-sm transition-all duration-300",
                                mediaType === "tv"
                                    ? "bg-primary text-white"
                                    : "text-primary hover:bg-primary hover:text-white",
                            )}
                            onClick={() => handleMediaTypeChange("tv")}>
                            TV Shows
                        </button>
                    </div>
                </div>

                <GenreMultiSelect
                    genreIds={genreIds}
                    genres={genres ?? new Map()}
                    disabled={genresPending}
                    onChange={handleGenreChange}
                />
            </AnimatedFadeIn>

            <MediaGrid
                items={items}
                isLoading={isPending || genresPending}
                isError={isError}
                error={error}
                onRetry={() => refetch()}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
            />
        </main>
    );
}
