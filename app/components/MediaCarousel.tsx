import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API } from "@/constants/api";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { cn } from "@/utils/css-helpers";
import { getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import { MediaCaption, MediaThumb } from "./MediaCard";
import { MediaCarouselSkeleton } from "./MediaCarouselSkeleton";
import { SectionError } from "./ui/SectionError";
import { SectionHeading } from "./ui/SectionHeading";
import { SegmentedControl } from "./ui/SegmentedControl";

const MEDIA_TYPE_OPTIONS = [
    { value: "movie", label: "Movies" },
    { value: "tv", label: "TV Shows" },
] as const;

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

const arrowClassName =
    "absolute top-0 z-10 flex w-10 cursor-pointer items-center justify-center bg-scrim/55 text-white transition-[opacity,background-color] duration-300 hover:bg-scrim/75 disabled:cursor-not-allowed disabled:opacity-40 md:opacity-0 md:group-hover/carousel:opacity-100 md:focus-visible:opacity-100";

function CarouselCard({
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
    const title = getTitle(media);
    const imagePath = orientation === "landscape" ? media.backdrop_path : media.poster_path;
    const imageBase = orientation === "landscape" ? API.IMAGE_BACKDROP_URL : API.IMAGE_POSTER_URL;

    return (
        <button
            type="button"
            className={cn(
                "group/card min-w-0 cursor-pointer pr-4 text-left",
                orientation === "landscape"
                    ? "flex-[0_0_200px] md:flex-[0_0_300px]"
                    : "flex-[0_0_160px] md:flex-[0_0_250px]",
            )}
            onClick={() => navigate(`/media/${mediaType}/${media.id}`, { viewTransition: true })}
        >
            <div className="relative">
                <MediaThumb
                    src={imagePath ? `${imageBase}${imagePath}` : null}
                    alt={title ?? ""}
                    fallback={title ?? "No image"}
                    className={cardHeight[orientation]}
                />
                {topLabelEnabled && (
                    <div className="absolute top-0 left-0 bg-primary-strong text-on-primary p-2">
                        <p className="text-xs text-center uppercase">
                            Top
                            <span className="block text-sm font-medium tabular-nums">
                                {index + 1}
                            </span>
                        </p>

                        {/* Zero-size triangle notches under the rank pennant: the
                            coloured edge is border-t, the wide edges are transparent. */}
                        {/* impeccable-disable-next-line side-tab: transparent borders, not a card accent */}
                        <span className="inline-block w-0 h-0 border-t-10 border-t-primary-strong border-r-20 border-r-transparent absolute top-full left-0"></span>
                        {/* impeccable-disable-next-line side-tab: transparent borders, not a card accent */}
                        <span className="inline-block w-0 h-0 border-t-10 border-t-primary-strong border-l-20 border-l-transparent absolute top-full right-0"></span>
                    </div>
                )}
            </div>
            <MediaCaption title={title} year={getReleaseYear(media)} rating={media.vote_average} />
        </button>
    );
}

const cardHeight = { landscape: "h-40", portrait: "h-100" } as const;

interface IProps {
    mediaData: MovieResult[] | TvResult[];
    options: EmblaOptionsType;
    title: string;
    orientation?: "portrait" | "landscape";
    topLabelEnabled?: boolean;
    mediaType: MediaType;
    setMediaType: (mediaType: MediaType) => void;
    isLoading?: boolean;
    isError?: boolean;
    error?: unknown;
    onRetry?: () => void;
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
    isError,
    error,
    onRetry,
    showMediaTypeSelector = true,
}: IProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
        usePrevNextButtons(emblaApi);

    if (isLoading) {
        return <MediaCarouselSkeleton title={title} orientation={orientation} />;
    }

    if (isError) {
        return (
            <div className="w-full mx-auto">
                <SectionHeading className="mb-4">{title}</SectionHeading>
                <SectionError error={error} onRetry={onRetry} />
            </div>
        );
    }

    return (
        <div className="w-full mx-auto group/carousel">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <SectionHeading>{title}</SectionHeading>

                {showMediaTypeSelector && (
                    <SegmentedControl
                        label={`${title}: show movies or TV shows`}
                        options={MEDIA_TYPE_OPTIONS}
                        value={mediaType}
                        onChange={setMediaType}
                    />
                )}
            </div>
            <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex touch-pan-y touch-pinch-zoom">
                        {mediaData.map((media, index) => (
                            <CarouselCard
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

                <button
                    type="button"
                    onClick={onPrevButtonClick}
                    disabled={prevBtnDisabled}
                    aria-label={`Scroll ${title} back`}
                    className={cn(arrowClassName, "left-0 rounded-l-md", cardHeight[orientation])}
                >
                    <ChevronLeft size={32} />
                </button>
                <button
                    type="button"
                    onClick={onNextButtonClick}
                    disabled={nextBtnDisabled}
                    aria-label={`Scroll ${title} forward`}
                    className={cn(arrowClassName, "right-4 rounded-r-md", cardHeight[orientation])}
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
}
