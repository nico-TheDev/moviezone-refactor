import type { Movie, MovieResult, TvResult, TvShow } from "@/types/tmdb";
import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useState } from "react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { getReleaseYear, getTitle } from "@/utils/media-string-helpers";
import { API } from "@/constants/api";
import { ChevronLeft, ChevronRight, StarIcon } from "lucide-react";

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
        emblaApi.on("reinit", onSelect).on("select", onSelect);
    }, [emblaApi, onSelect]);

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick,
    };
};

export const PrevButton = (props: React.ComponentPropsWithRef<"button">) => {
    const { children, disabled, ...restProps } = props;

    return (
        <button
            className={"embla__button embla__button--prev".concat(
                disabled ? " embla__button--disabled" : "",
            )}
            type="button"
            {...restProps}>
            <ChevronLeft size={40} />
            {children}
        </button>
    );
};

export const NextButton = (props: React.ComponentPropsWithRef<"button">) => {
    const { children, disabled, ...restProps } = props;

    return (
        <button
            className={"embla__button embla__button--next".concat(
                disabled ? " embla__button--disabled" : "",
            )}
            type="button"
            {...restProps}>
            <ChevronRight size={40} />
            {children}
        </button>
    );
};
interface IProps {
    mediaData: MovieResult[] | TvResult[];
    options: EmblaOptionsType;
    title: string;
}

function MediaCard({ media }: { media: MovieResult | TvResult }) {
    return (
        <div className="embla__slide group/card-img cursor-pointer" key={media.id}>
            <div className="h-40 overflow-hidden mb-2 rounded-md cursor-pointer">
                <img
                    src={`${API.IMAGE_BACKDROP_URL}${media.backdrop_path}`}
                    alt={getTitle(media) ?? ""}
                    className="block w-full h-full object-cover group-hover/card-img:scale-110 transition-transform duration-300"
                />
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

export function MediaCarousel({ mediaData, options, title }: IProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
        usePrevNextButtons(emblaApi);

    return (
        <div className="embla media-carousel max-w-[90%] mx-auto group/carousel">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 bg-primary block h-8" />
                {title}
            </h2>
            <div className="embla__viewport relative" ref={emblaRef}>
                <div className="embla__container">
                    {mediaData.map((media) => (
                        <MediaCard key={media.id} media={media} />
                    ))}
                </div>

                <PrevButton
                    onClick={onPrevButtonClick}
                    disabled={prevBtnDisabled}
                    className="opacity-0 absolute top-0 left-0 bg-gray-900/50 hover:bg-gray-900/80 cursor-pointer h-40 w-10 group-hover/carousel:opacity-100 transition-opacity duration-300"
                />
                <NextButton
                    onClick={onNextButtonClick}
                    disabled={nextBtnDisabled}
                    className="opacity-0 absolute top-0 right-0 bg-gray-900/50 hover:bg-gray-900/80 cursor-pointer h-40 w-10 group-hover/carousel:opacity-100 transition-opacity duration-300"
                />
            </div>
        </div>
    );
}
