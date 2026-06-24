import type { Route } from "./+types/search";
import { MediaGrid } from "@/components/MediaGrid";
import { AnimatedPageHeader } from "@/components/ui/AnimatedPageHeader";
import { searchQueries } from "@/queries/search.queries";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function meta({ params }: Route.MetaArgs) {
    const query = decodeURIComponent(params.query);
    return [{ title: `Search: ${query} | MovieZone` }];
}

export default function SearchPage({ params }: Route.ComponentProps) {
    const query = decodeURIComponent(params.query);

    const { data, isPending, isError, error, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteQuery(searchQueries.infinite(query));

    const items = useMemo(
        () =>
            data?.pages.flatMap((page) =>
                page.results.map((media) => ({
                    media,
                    mediaType: media.media_type,
                })),
            ) ?? [],
        [data],
    );

    return (
        <main className="max-w-[85%] mx-auto py-24">
            <AnimatedPageHeader className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-1 bg-primary block h-10" />
                    Search Results
                </h1>
                <p className="text-gray-400 text-sm">
                    Showing results for &ldquo;{query}&rdquo;
                </p>
            </AnimatedPageHeader>
            <MediaGrid
                items={items}
                isLoading={isPending}
                isError={isError}
                error={error}
                onRetry={() => refetch()}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                emptyMessage={`No movies or TV shows found for "${query}".`}
            />
        </main>
    );
}
