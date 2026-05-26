import { Skeleton } from "@/components/ui/Skeleton";
import { mediaQueries } from "@/queries/media.queries";
import type { MediaType } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router";

interface IProps {
    genreIds: number[] | undefined;
    mediaType: MediaType;
}

const SKELETON_PILL_COUNT = 3;

function GenreListSkeleton() {
    return (
        <span className="inline-flex gap-1">
            {Array.from({ length: SKELETON_PILL_COUNT }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-14 rounded" />
            ))}
        </span>
    );
}

function GenreList({ genreIds, mediaType }: IProps) {
    const { data: genres, isPending, isError } = useQuery(mediaQueries.genres(mediaType));

    if (isPending) {
        return <GenreListSkeleton />;
    }

    if (isError || !genres) {
        return <span className="text-xs text-gray-500">Genres unavailable</span>;
    }

    const visibleGenreIds = genreIds?.filter((id) => genres.has(id)) ?? [];

    if (visibleGenreIds.length === 0) {
        return null;
    }

    return (
        <span className="inline-flex gap-1 text-sm text-gray-300">
            {visibleGenreIds.map((id) => (
                <NavLink
                    key={id}
                    to={`/${mediaType}/genre/${id}`}
                    className="px-2 py-1 text-xs font-light bg-primary text-white rounded hover:bg-primary-hover">
                    {genres.get(id)}
                </NavLink>
            ))}
        </span>
    );
}

export default GenreList;
