import { API } from "@/constants/api";
import useEmblaCarousel from "embla-carousel-react";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { InfoIcon, StarIcon } from "lucide-react";
import GenreList from "@/components/GenreList";
import { useNavigate } from "react-router";
import { getReleaseYear, getTitle, isMovieResult } from "@/utils/media-string-helpers";

function HeroFeaturedItem({ mediaData }: { mediaData: MovieResult | TvResult }) {
    const navigate = useNavigate();

    const mediaType = isMovieResult(mediaData) ? "movie" : "tv";

    return (
        <div className="flex-[0_0_100%] min-w-0 h-svh" key={mediaData.id}>
            <img
                src={`${API.IMAGE_BACKDROP_URL}${mediaData.backdrop_path}`}
                alt={getTitle(mediaData) ?? ""}
                className="absolute z-0 w-full h-full object-cover brightness-50"
            />

            <div className="relative flex max-w-7xl w-full mx-auto h-full z-10 flex-col justify-center pt-50">
                <div className="p-4">
                    <h3 className="text-4xl font-display mb-4 max-w-2xl">{getTitle(mediaData)}</h3>
                    <p className="flex items-center gap-2 text-sm text-gray-300 font-light mb-2">
                        <span className="inline-flex items-center text-primary gap-2 font-medium">
                            <StarIcon
                                size={20}
                                className="inline-block text-primary"
                                fill="currentColor"
                            />
                            {mediaData.vote_average.toFixed(2)}
                        </span>
                        •<span className="">{getReleaseYear(mediaData)}</span>
                        •
                        <GenreList genre_ids={mediaData.genre_ids} type={mediaType} />
                    </p>

                    <p className="max-w-xl line-clamp-4 text-sm mb-6">{mediaData.overview}</p>

                    <div className="flex items-center gap-2 justify-between">
                        <button
                            className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover cursor-pointer inline-flex items-center gap-2"
                            onClick={() =>
                                navigate(`/media/${mediaType}/${mediaData.id}`, {
                                    replace: true,
                                })
                            }>
                            <InfoIcon size={20} className="inline-block text-white" />
                            See More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface IProps {
    items: MovieResult[] | TvResult[];
    mediaType: MediaType;
}

type FeaturedItem = MovieResult | TvResult;

export function HeroFeaturedCarousel({ items, mediaType }: IProps) {
    const [emblaRef] = useEmblaCarousel({ loop: true });

    return (
        <div>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y touch-pinch-zoom w-screen">
                    {(items as FeaturedItem[]).map((item) => (
                        <HeroFeaturedItem key={item.id} mediaData={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}
