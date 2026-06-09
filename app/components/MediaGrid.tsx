import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { MediaGridCard } from "./MediaGridCard";
import { Skeleton } from "./ui/Skeleton";

type Props = {
    items: Array<{ media: MovieResult | TvResult; mediaType: MediaType }>;
    isLoading?: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
    emptyMessage?: string;
};

export function MediaGrid({
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage = false,
    fetchNextPage,
    emptyMessage = "No results found.",
}: Props) {
    const sentinelRef = useInfiniteScroll(
        () => fetchNextPage?.(),
        hasNextPage,
        !!isFetchingNextPage,
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[2/3] w-full rounded-md mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map(({ media, mediaType }) => (
                    <MediaGridCard key={`${mediaType}-${media.id}`} media={media} mediaType={mediaType} />
                ))}
            </div>
            {hasNextPage && <div ref={sentinelRef} className="h-10 mt-4" />}
            {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </>
    );
}
