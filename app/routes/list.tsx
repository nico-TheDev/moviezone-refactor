import type { Route } from "./+types/list";
import { MediaGrid } from "@/components/MediaGrid";
import { assertListCategory, getListConfig } from "@/constants/lists";
import { listQueries } from "@/queries/list.queries";
import { assertMediaType } from "@/utils/media-string-helpers";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function meta({ params }: Route.MetaArgs) {
    const mediaType = assertMediaType(params.mediaType);
    const category = assertListCategory(mediaType, params.category);
    const config = getListConfig(mediaType, category);
    return [{ title: `${config.title} | MovieZone` }];
}

export default function ListPage({ params }: Route.ComponentProps) {
    const mediaType = assertMediaType(params.mediaType);
    const category = assertListCategory(mediaType, params.category);
    const config = getListConfig(mediaType, category);

    const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
        listQueries.infinite(mediaType, category),
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
                {config.title}
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
