import { API } from "@/constants/api";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";

type GridMedia = (MovieResult | TvResult) & {
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number;
};
import { getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router";

export function MediaGridCard({
    media,
    mediaType,
}: {
    media: GridMedia;
    mediaType: MediaType;
}) {
    const navigate = useNavigate();

    return (
        <div
            className="group cursor-pointer"
            onClick={() => navigate(`/media/${mediaType}/${media.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/media/${mediaType}/${media.id}`);
            }}>
            <div className="overflow-hidden rounded-md mb-2 aspect-[2/3] bg-gray-900">
                {media.poster_path ? (
                    <img
                        src={`${API.IMAGE_POSTER_URL}${media.poster_path}`}
                        alt={getTitle(media) ?? ""}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No image
                    </div>
                )}
            </div>
            <p className="text-sm text-white group-hover:text-primary truncate">
                {getTitle(media)}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{getReleaseYear(media)}</span>
                <span className="inline-flex items-center gap-1 text-primary">
                    <StarIcon size={12} fill="currentColor" />
                    {media.vote_average?.toFixed(1) ?? "—"}
                </span>
            </div>
        </div>
    );
}
