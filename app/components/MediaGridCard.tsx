import { useNavigate } from "react-router";
import { MediaCaption, MediaThumb } from "@/components/MediaCard";
import { API } from "@/constants/api";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { getReleaseYear, getTitle } from "@/utils/media-string-helpers";

type GridMedia = (MovieResult | TvResult) & {
    title?: string;
    name?: string;
    poster_path?: string | null;
    vote_average?: number;
};

export function MediaGridCard({ media, mediaType }: { media: GridMedia; mediaType: MediaType }) {
    const navigate = useNavigate();
    const title = getTitle(media);

    return (
        <button
            type="button"
            className="group/card block w-full cursor-pointer rounded-md text-left"
            onClick={() => navigate(`/media/${mediaType}/${media.id}`, { viewTransition: true })}
        >
            <MediaThumb
                src={media.poster_path ? `${API.IMAGE_POSTER_URL}${media.poster_path}` : null}
                alt={title ?? ""}
                fallback="No image"
                className="aspect-[2/3]"
            />
            <MediaCaption title={title} year={getReleaseYear(media)} rating={media.vote_average} />
        </button>
    );
}
