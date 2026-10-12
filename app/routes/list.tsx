import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MediaGrid } from "@/components/MediaGrid";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { assertListCategory, getListConfig } from "@/constants/lists";
import { listQueries } from "@/queries/list.queries";
import { assertMediaType } from "@/utils/media-string-helpers";
import type { Route } from "./+types/list";

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

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery(listQueries.infinite(mediaType, category));

    const items = useMemo(
        () =>
            data?.pages.flatMap((page) => page.results.map((media) => ({ media, mediaType }))) ??
            [],
        [data, mediaType],
    );

    return (
        <main className="max-w-[85%] mx-auto py-24">
            <Reveal className="mb-8">
                <SectionHeading as="h1" size="page">
                    {config.title}
                </SectionHeading>
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
            />
        </main>
    );
}
