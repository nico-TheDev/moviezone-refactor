import { API } from "@/constants/api";
import useEmblaCarousel from "embla-carousel-react";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { InfoIcon, StarIcon } from "lucide-react";
import GenreList from "@/components/GenreList";
import { useNavigate } from "react-router";
import { getReleaseYear, getTitle, isMovieResult } from "@/utils/media-string-helpers";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const AUTOPLAY_DELAY = 5000;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const contentContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
};

const contentItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: EASE_OUT },
    },
};

function HeroContentBlock({
    children,
    isActive,
    reduce,
}: {
    children: ReactNode;
    isActive: boolean;
    reduce: boolean | null;
}) {
    if (reduce) return <>{children}</>;

    return (
        <motion.div
            variants={contentItem}
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}>
            {children}
        </motion.div>
    );
}

function HeroFeaturedItem({
    mediaData,
    priority = false,
    isActive,
}: {
    mediaData: MovieResult | TvResult;
    priority?: boolean;
    isActive: boolean;
}) {
    const navigate = useNavigate();
    const reduce = useReducedMotion();
    const mediaType = isMovieResult(mediaData) ? "movie" : "tv";

    return (
        <div className="relative flex-[0_0_100%] min-w-0 h-full overflow-hidden">
            {reduce ? (
                <img
                    src={`${API.IMAGE_BACKDROP_URL}${mediaData.backdrop_path}`}
                    alt={getTitle(mediaData) ?? ""}
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : "auto"}
                    className="absolute z-0 w-full h-full object-cover brightness-50"
                />
            ) : (
                <motion.img
                    key={`${mediaData.id}-backdrop`}
                    src={`${API.IMAGE_BACKDROP_URL}${mediaData.backdrop_path}`}
                    alt={getTitle(mediaData) ?? ""}
                    loading={priority ? "eager" : "lazy"}
                    fetchPriority={priority ? "high" : "auto"}
                    initial={{ scale: 1 }}
                    animate={isActive ? { scale: 1.07 } : { scale: 1 }}
                    transition={{ duration: 8, ease: "linear" }}
                    className="absolute z-0 w-full h-full object-cover brightness-50"
                />
            )}

            <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent via-black/40 to-black z-1 pointer-events-none" />

            <div className="relative flex max-w-[85%] w-full mx-auto h-full z-10 flex-col justify-center pt-50">
                {reduce ? (
                    <div className="p-4">
                        <h3 className="text-2xl md:text-4xl font-display mb-4 max-w-2xl">
                            {getTitle(mediaData)}
                        </h3>
                        <p className="flex items-center gap-2 text-sm text-gray-300 font-light mb-2 flex-wrap">
                            <span className="inline-flex items-center text-primary gap-2 font-medium">
                                <StarIcon
                                    size={20}
                                    className="inline-block text-primary"
                                    fill="currentColor"
                                />
                                {mediaData.vote_average.toFixed(2)}
                            </span>
                            •<span>{getReleaseYear(mediaData)}</span>•
                            <GenreList genreIds={mediaData.genre_ids} mediaType={mediaType} />
                        </p>
                        <p className="max-w-xl line-clamp-4 text-sm mb-6">{mediaData.overview}</p>
                        <div className="flex items-center gap-2 justify-between">
                            <button
                                type="button"
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
                ) : (
                    <motion.div
                        className="p-4"
                        variants={contentContainer}
                        initial="hidden"
                        animate={isActive ? "visible" : "hidden"}>
                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <h3 className="text-2xl md:text-4xl font-display mb-4 max-w-2xl">
                                {getTitle(mediaData)}
                            </h3>
                        </HeroContentBlock>

                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <p className="flex items-center gap-2 text-sm text-gray-300 font-light mb-2 flex-wrap">
                                <span className="inline-flex items-center text-primary gap-2 font-medium">
                                    <StarIcon
                                        size={20}
                                        className="inline-block text-primary"
                                        fill="currentColor"
                                    />
                                    {mediaData.vote_average.toFixed(2)}
                                </span>
                                •<span>{getReleaseYear(mediaData)}</span>•
                                <GenreList genreIds={mediaData.genre_ids} mediaType={mediaType} />
                            </p>
                        </HeroContentBlock>

                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <p className="max-w-xl line-clamp-4 text-sm mb-6">
                                {mediaData.overview}
                            </p>
                        </HeroContentBlock>

                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <div className="flex items-center gap-2 justify-between">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover cursor-pointer inline-flex items-center gap-2"
                                    onClick={() =>
                                        navigate(`/media/${mediaType}/${mediaData.id}`, {
                                            replace: true,
                                        })
                                    }>
                                    <InfoIcon size={20} className="inline-block text-white" />
                                    See More
                                </motion.button>
                            </div>
                        </HeroContentBlock>
                    </motion.div>
                )}
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
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const reduce = useReducedMotion();

    const scrollNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi || items.length <= 1) return;
        const timer = setInterval(scrollNext, AUTOPLAY_DELAY);
        return () => clearInterval(timer);
    }, [emblaApi, scrollNext, items.length]);

    return (
        <motion.div
            className="h-full overflow-hidden"
            ref={emblaRef}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}>
            <div className="flex touch-pan-y touch-pinch-zoom h-full w-full">
                {(items as FeaturedItem[]).map((item, index) => (
                    <HeroFeaturedItem
                        key={item.id}
                        mediaData={item}
                        priority={index === 0}
                        isActive={index === selectedIndex}
                    />
                ))}
            </div>
        </motion.div>
    );
}
