import { useEffect, useRef } from "react";

export function useInfiniteScroll(
    onLoadMore: () => void,
    hasMore: boolean,
    isLoading: boolean,
) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    onLoadMore();
                }
            },
            { rootMargin: "200px" },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [onLoadMore, hasMore, isLoading]);

    return sentinelRef;
}
