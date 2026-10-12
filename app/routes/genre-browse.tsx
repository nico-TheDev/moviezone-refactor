import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { GenreMultiSelect } from "@/components/GenreMultiSelect";
import { MediaGrid } from "@/components/MediaGrid";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
import type { Route } from "./+types/genre-browse";

export function meta({}: Route.MetaArgs) {
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

    const { data: genres, isPending: genresPending } = useQuery(mediaQueries.genres(mediaType));
    const { data: movieGenres } = useQuery(mediaQueries.genres("movie"));
    const { data: tvGenres } = useQuery(mediaQueries.genres("tv"));

    const genreTitle = formatGenreTitle(genreIds, genres ?? new Map(), params.slug);

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        ...listQueries.genreInfinite(mediaType, genreIds),
        enabled: genreIds.length > 0,
    });

    const items = useMemo(
        () =>
            data?.pages.flatMap((page) => page.results.map((media) => ({ media, mediaType }))) ??
            [],
        [data, mediaType],
    );

    const navigateWithGenres = (nextMediaType: MediaType, nextGenreIds: number[]) => {
        const names =
            nextMediaType === "movie" ? (movieGenres ?? new Map()) : (tvGenres ?? new Map());
        navigate(buildGenreBrowseUrl(nextMediaType, nextGenreIds, names));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGenreChange = (nextIds: number[]) => {
        navigateWithGenres(mediaType, nextIds);
    };

    const handleMediaTypeChange = (nextMediaType: MediaType) => {
        if (nextMediaType === mediaType) return;
        const fromNames =
            mediaType === "movie" ? (movieGenres ?? new Map()) : (tvGenres ?? new Map());
        const toGenres =
            nextMediaType === "movie" ? (movieGenres ?? new Map()) : (tvGenres ?? new Map());
        const mappedIds = mapGenreIdsAcrossMediaType(genreIds, fromNames, toGenres);
        navigateWithGenres(nextMediaType, mappedIds);
    };

    return (
        <main className="max-w-[85%] mx-auto py-24">
            <Reveal className="mb-8">
                <SectionHeading as="h1" size="page">
                    {genreTitle}
                </SectionHeading>
            </Reveal>

            <Reveal
                className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4 mb-8"
                delay={0.06}
            >
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-ink-subtle uppercase tracking-wide">Type</span>
                    <SegmentedControl
                        label="Media type"
                        options={[
                            { value: "movie", label: "Movies" },
                            { value: "tv", label: "TV Shows" },
                        ]}
                        value={mediaType}
                        onChange={handleMediaTypeChange}
                    />
                </div>

                <GenreMultiSelect
                    genreIds={genreIds}
                    genres={genres ?? new Map()}
                    disabled={genresPending}
                    onChange={handleGenreChange}
                />
            </Reveal>

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
