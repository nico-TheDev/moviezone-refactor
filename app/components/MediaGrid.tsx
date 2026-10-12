import { useMemo } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { MediaGridCard } from "./MediaGridCard";
import { ErrorState } from "./ui/ErrorState";
import { Reveal } from "./ui/Reveal";
import { Skeleton } from "./ui/Skeleton";

const gridClassName =
    "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

type Props = {
    items: Array<{ media: MovieResult | TvResult; mediaType: MediaType }>;
    isLoading?: boolean;
    isError?: boolean;
    error?: unknown;
    onRetry?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
    emptyMessage?: string;
};

export function MediaGrid({
    items,
    isLoading,
    isError,
    error,
    onRetry,
    isFetchingNextPage,
    hasNextPage = false,
    fetchNextPage,
    emptyMessage = "No results found.",
}: Props) {
    // TMDB pages overlap when rankings shift between requests, so the same
    // title can arrive twice. Keep the first: keys stay unique, rows stay stable.
    const uniqueItems = useMemo(() => {
        const seen = new Set<string>();
        return items.filter(({ media, mediaType }) => {
            const key = `${mediaType}-${media.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [items]);

    const sentinelRef = useInfiniteScroll(
        () => fetchNextPage?.(),
        hasNextPage,
        !!isFetchingNextPage,
    );

    if (isLoading) {
        return (
            <div className={gridClassName} aria-busy="true">
                {Array.from({ length: 12 }, (_, i) => `card-${i}`).map((cardKey) => (
                    <div key={cardKey}>
                        <Skeleton className="aspect-[2/3] w-full" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                        <Skeleton className="h-3 w-1/2 mt-1.5" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return <ErrorState layout="section" error={error} onRetry={onRetry} />;
    }

    if (uniqueItems.length === 0) {
        return (
            <Reveal className="text-center py-16 text-ink-muted">
                <p>{emptyMessage}</p>
            </Reveal>
        );
    }

    return (
        <>
            <div className={gridClassName}>
                {uniqueItems.map(({ media, mediaType }, index) => (
                    <Reveal key={`${mediaType}-${media.id}`} when="inView" index={index % 12}>
                        <MediaGridCard media={media} mediaType={mediaType} />
                    </Reveal>
                ))}
            </div>
            {hasNextPage && <div ref={sentinelRef} className="h-10 mt-4" />}
            {isFetchingNextPage && (
                <div className="flex justify-center py-6" role="status">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="sr-only">Loading more titles</span>
                </div>
            )}
        </>
    );
}
