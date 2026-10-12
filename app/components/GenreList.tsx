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
                <Skeleton key={key} className="h-6 w-16 rounded-full" />
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
        return <span className="text-xs text-white/70">Genres unavailable</span>;
    }

    const visibleGenreIds = genreIds?.filter((id) => genres.has(id)) ?? [];

    if (visibleGenreIds.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {visibleGenreIds.map((id) => {
                const name = genres.get(id) ?? "Unknown";
                return (
                    <NavLink
                        key={id}
                        to={genreBrowsePath(mediaType, id, name)}
                        className="rounded-full bg-primary-strong px-2.5 py-1 text-xs text-on-primary transition-colors hover:bg-primary-hover"
                        viewTransition
                    >
                        {name}
                    </NavLink>
                );
            })}
        </div>
    );
}

export default GenreList;
