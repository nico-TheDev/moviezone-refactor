import type { MediaType, Movie, MovieResult, TvResult, TvShow } from "@/types/tmdb";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import { API } from "@/constants/api";
import { ChevronLeft, ChevronRight, StarIcon } from "lucide-react";
import { cn } from "@/utils/css-helpers";
import { MediaCarouselSkeleton } from "./MediaCarouselSkeleton";
import { useNavigate } from "react-router";

type UsePrevNextButtonsType = {
    prevBtnDisabled: boolean;
    nextBtnDisabled: boolean;
    onPrevButtonClick: () => void;
    onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
    emblaApi: EmblaCarouselType | undefined,
): UsePrevNextButtonsType => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
    }, [emblaApi]);

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect(emblaApi);
        emblaApi.on("reInit", onSelect).on("select", onSelect);
    }, [emblaApi, onSelect]);

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    };
};

export const PrevButton = ({
    children,
    className,
    ...restProps
}: React.ComponentPropsWithRef<"button">) => {
    return (
        <button
            type="button"
            className={`disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
            {...restProps}>
            <ChevronLeft size={40} />
            {children}
        </button>
    );
};

export const NextButton = ({
    children,
    className,
    ...restProps
}: React.ComponentPropsWithRef<"button">) => {
    return (
        <button
            type="button"
            className={`disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
            {...restProps}>
            <ChevronRight size={40} />
            {children}
        </button>
    );
};

function MediaCard({
    media,
    mediaType,
    orientation,
    topLabelEnabled = false,
    index,
}: {
    media: MovieResult | TvResult;
    orientation: "portrait" | "landscape";
    topLabelEnabled?: boolean;
    index: number;
    mediaType: MediaType;
}) {
    const navigate = useNavigate();

    return (
        <div
            className={cn(
                "min-w-0 group/card-img cursor-pointer pr-4",
                orientation === "landscape" ? "flex-[0_0_200px] md:flex-[0_0_300px]" : "flex-[0_0_160px] md:flex-[0_0_250px]",
            )}
            key={media.id}
            onClick={() => navigate(`/media/${mediaType}/${media.id}`)}>
            <div
                className={cn(
                    "overflow-hidden mb-2 rounded-md cursor-pointer relative",
                    orientation === "landscape" ? "h-40" : "h-100",
                )}>
                <img
                    src={
                        orientation === "landscape"
                            ? `${API.IMAGE_BACKDROP_URL}${media.backdrop_path}`
                            : `${API.IMAGE_POSTER_URL}${media.poster_path}`
                    }
                    alt={getTitle(media) ?? ""}
                    loading="lazy"
                    className="block w-full h-full object-cover group-hover/card-img:scale-110 transition-transform duration-300"
                />
                {topLabelEnabled && (
                    <div className="absolute top-0 left-0 bg-primary text-white p-2">
                        <p className="text-xs text-center uppercase">
                            Top
                            <span className="block text-sm font-medium">{index + 1}</span>
                        </p>

                        <span className="inline-block w-0 h-0 border-t-10 border-t-primary border-r-20 border-r-transparent absolute top-full left-0"></span>
                        <span className="inline-block w-0 h-0 border-t-10 border-t-primary border-l-20 border-l-transparent absolute top-full right-0"></span>
                    </div>
                )}
            </div>
            <div className="text-white">
                <p className="text-sm group-hover/card-img:text-primary mb-2">{getTitle(media)}</p>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{getReleaseYear(media)}</span>

                    <span className="inline-flex items-center gap-1 text-xs">
                        <StarIcon
                            fill="currentColor"
                            size={16}
                            className="inline-block text-primary"
                        />
                        {media.vote_average.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface IProps {
    mediaData: MovieResult[] | TvResult[];
    options: EmblaOptionsType;
    title: string;
    orientation?: "portrait" | "landscape";
    topLabelEnabled?: boolean;
    mediaType: MediaType;
    setMediaType: (mediaType: MediaType) => void;
    isLoading?: boolean;
    showMediaTypeSelector?: boolean;
}

export function MediaCarousel({
    mediaData,
    options,
    title,
    orientation = "landscape",
    topLabelEnabled = false,
    mediaType = "movie",
    setMediaType,
    isLoading,
    showMediaTypeSelector = true,
}: IProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
        usePrevNextButtons(emblaApi);

    if (isLoading) {
        return <MediaCarouselSkeleton title={title} orientation={orientation} />;
    }

    return (
        <div className="w-full mx-auto group/carousel">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold  text-white flex items-center gap-2">
                    <span className="w-1 bg-primary block h-8" />
                    {title}
                </h2>

                <div
                    className={cn(
                        " items-center border rounded-md border-primary",
                        showMediaTypeSelector ? "flex" : "hidden",
                    )}>
                    <button
                        className={cn(
                            "font-medium px-4 py-2 text-primary hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer border-r border-primary",
                            mediaType === "movie" && "bg-primary text-white",
                        )}
                        onClick={() => setMediaType("movie")}>
                        Movies
                    </button>
                    <button
                        className={cn(
                            "px-4 py-2 text-primary hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer",
                            mediaType === "tv" && "bg-primary text-white",
                        )}
                        onClick={() => setMediaType("tv")}>
                        Series
                    </button>
                </div>
            </div>
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex touch-pan-y touch-pinch-zoom">
                        {mediaData.map((media, index) => (
                            <MediaCard
                                key={media.id}
                                media={media}
                                orientation={orientation}
                                topLabelEnabled={topLabelEnabled}
                                index={index}
                                mediaType={mediaType}
                            />
                        ))}
                    </div>
                </div>

                <PrevButton
                    onClick={onPrevButtonClick}
                    disabled={prevBtnDisabled}
                    className={cn(
                        "opacity-100 md:opacity-0 absolute top-0 left-0 bg-gray-900/50 hover:bg-gray-900/80 cursor-pointer w-10 md:group-hover/carousel:opacity-100 transition-opacity duration-300",
                        orientation === "landscape" ? "h-40" : "h-100",
                    )}
                />
                <NextButton
                    onClick={onNextButtonClick}
                    disabled={nextBtnDisabled}
                    className={cn(
                        "opacity-100 md:opacity-0 absolute top-0 right-0 bg-gray-900/50 hover:bg-gray-900/80 cursor-pointer w-10 md:group-hover/carousel:opacity-100 transition-opacity duration-300",
                        orientation === "landscape" ? "h-40" : "h-100",
                    )}
                />
            </div>
        </div>
    );
}
