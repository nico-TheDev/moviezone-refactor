import type { Route } from "./+types/genre-browse";
import { MediaGrid } from "@/components/MediaGrid";
import { listQueries } from "@/queries/list.queries";
import { mediaQueries } from "@/queries/media.queries";
import { assertMediaType } from "@/utils/media-string-helpers";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function meta({ params }: Route.MetaArgs) {
    return [{ title: `Genre | MovieZone` }];
}

export default function GenreBrowsePage({ params }: Route.ComponentProps) {
    const mediaType = assertMediaType(params.type);
    const genreId = params.id;

    const { data: genres } = useQuery(mediaQueries.genres(mediaType));
    const genreName = genres?.get(Number(genreId)) ?? params.slug;

    const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
        listQueries.genreInfinite(mediaType, genreId),
    );

    const items = useMemo(
        () =>
            data?.pages.flatMap((page) =>
                page.results.map((media) => ({ media, mediaType })),
            ) ?? [],
        [data, mediaType],
    );

    return (
        <main className="max-w-[85%] mx-auto py-24">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="w-1 bg-primary block h-10" />
                {genreName}
            </h1>
            <MediaGrid
                items={items}
                isLoading={isPending}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
            />
        </main>
    );
}
