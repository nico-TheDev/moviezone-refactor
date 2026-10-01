import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router";
import { Skeleton } from "@/components/ui/Skeleton";
import { mediaQueries } from "@/queries/media.queries";
import type { MediaType } from "@/types/tmdb";
import { genreBrowsePath } from "@/utils/genre-helpers";

interface IProps {
    genreIds: number[] | undefined;
    mediaType: MediaType;
}

const SKELETON_PILL_KEYS = ["pill-1", "pill-2", "pill-3"];

function GenreListSkeleton() {
    return (
        <span className="inline-flex gap-1">
            {SKELETON_PILL_KEYS.map((key) => (
                <Skeleton key={key} className="h-5 w-14 rounded" />
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
        <div className="flex flex-wrap gap-1 text-sm text-gray-300">
            {visibleGenreIds.map((id) => {
                const name = genres.get(id) ?? "Unknown";
                return (
                    <NavLink
                        key={id}
                        to={genreBrowsePath(mediaType, id, name)}
                        className="px-2 py-1 text-xs font-light bg-primary text-white rounded hover:bg-primary-hover"
                    >
                        {name}
                    </NavLink>
                );
            })}
        </div>
    );
}

export default GenreList;
