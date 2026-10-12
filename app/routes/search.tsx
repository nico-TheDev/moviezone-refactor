import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MediaGrid } from "@/components/MediaGrid";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { searchQueries } from "@/queries/search.queries";
import type { Route } from "./+types/search";

export function meta({ params }: Route.MetaArgs) {
    const query = decodeURIComponent(params.query);
    return [{ title: `Search: ${query} | MovieZone` }];
}

export default function SearchPage({ params }: Route.ComponentProps) {
    const query = decodeURIComponent(params.query);

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery(searchQueries.infinite(query));

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
            <Reveal className="mb-8">
                <SectionHeading as="h1" size="page">
                    Search Results
                </SectionHeading>
                <p className="mt-2 text-ink-muted text-sm">
                    Showing results for &ldquo;{query}&rdquo;
                </p>
            </Reveal>
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
