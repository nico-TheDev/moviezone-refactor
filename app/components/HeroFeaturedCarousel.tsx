import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, InfoIcon, Pause, Play } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
    type CSSProperties,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router";
import GenreList from "@/components/GenreList";
import { Rating } from "@/components/ui/Rating";
import { API } from "@/constants/api";
import { MOTION_EASE_OUT } from "@/lib/motion";
import type { MovieResult, TvResult } from "@/types/tmdb";
import { cn } from "@/utils/css-helpers";
import { getReleaseYear, getTitle, isMovieResult } from "@/utils/media-string-helpers";

const AUTOPLAY_DELAY = 5000;

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
        transition: { duration: 0.5, ease: MOTION_EASE_OUT },
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
            animate={isActive ? "visible" : "hidden"}
        >
            {children}
        </motion.div>
    );
}

/**
 * Rating, year and genres on one line. A `div`, not a `p`: GenreList renders
 * block content, which a paragraph cannot contain.
 */
function HeroMeta({
    mediaData,
    mediaType,
}: {
    mediaData: MovieResult | TvResult;
    mediaType: "movie" | "tv";
}) {
    const year = getReleaseYear(mediaData);
    return (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/85">
            <Rating value={mediaData.vote_average} size={18} className="font-medium text-white" />
            {year && <span>{year}</span>}
            <GenreList genreIds={mediaData.genre_ids} mediaType={mediaType} />
        </div>
    );
}

function HeroFeaturedItem({
    mediaData,
    priority = false,
    isActive,
    slideNumber,
    slideCount,
}: {
    mediaData: MovieResult | TvResult;
    priority?: boolean;
    isActive: boolean;
    slideNumber: number;
    slideCount: number;
}) {
    const navigate = useNavigate();
    const reduce = useReducedMotion();
    const mediaType = isMovieResult(mediaData) ? "movie" : "tv";

    return (
        <li
            className="relative flex-[0_0_100%] min-w-0 h-full overflow-hidden"
            aria-roledescription="slide"
            aria-label={`${slideNumber} of ${slideCount}`}
        >
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

            <div className="absolute inset-0 z-0 pointer-events-none bg-linear-to-t from-scrim/75 via-scrim/35 to-transparent md:bg-linear-to-r md:from-scrim/80 md:via-scrim/40 md:to-transparent" />

            <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent via-scrim/40 to-scrim z-1 pointer-events-none" />

            <div className="relative flex max-w-[85%] w-full mx-auto h-full z-10 flex-col justify-center pt-50">
                {reduce ? (
                    <div className="p-4">
                        <h3 className="text-2xl md:text-4xl font-display mb-4 max-w-2xl text-white">
                            {getTitle(mediaData)}
                        </h3>
                        <HeroMeta mediaData={mediaData} mediaType={mediaType} />
                        <p className="max-w-xl line-clamp-4 text-sm text-white/90 mb-6">
                            {mediaData.overview}
                        </p>
                        <div className="flex items-center gap-2 justify-between">
                            <button
                                type="button"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-strong px-5 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-hover"
                                onClick={() =>
                                    navigate(`/media/${mediaType}/${mediaData.id}`, {
                                        replace: true,
                                        viewTransition: true,
                                    })
                                }
                            >
                                <InfoIcon size={20} className="inline-block text-on-primary" />
                                See More
                            </button>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        className="p-4"
                        variants={contentContainer}
                        initial="hidden"
                        animate={isActive ? "visible" : "hidden"}
                    >
                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <h3 className="text-2xl md:text-4xl font-display mb-4 max-w-2xl text-white">
                                {getTitle(mediaData)}
                            </h3>
                        </HeroContentBlock>

                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <HeroMeta mediaData={mediaData} mediaType={mediaType} />
                        </HeroContentBlock>

                        <HeroContentBlock isActive={isActive} reduce={reduce}>
                            <p className="max-w-xl line-clamp-4 text-sm text-white/90 mb-6">
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
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-strong px-5 py-2.5 font-medium text-on-primary transition-colors hover:bg-primary-hover"
                                    onClick={() =>
                                        navigate(`/media/${mediaType}/${mediaData.id}`, {
                                            replace: true,
                                            viewTransition: true,
                                        })
                                    }
                                >
                                    <InfoIcon size={20} className="inline-block text-on-primary" />
                                    See More
                                </motion.button>
                            </div>
                        </HeroContentBlock>
                    </motion.div>
                )}
            </div>
        </li>
    );
}

interface IProps {
    items: MovieResult[] | TvResult[];
}

type FeaturedItem = MovieResult | TvResult;

const controlButtonClassName =
    "inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-scrim/45 text-white backdrop-blur-sm transition-colors hover:bg-scrim/70 focus-visible:outline-white";

const cycleStyle = { "--hero-cycle": `${AUTOPLAY_DELAY}ms` } as CSSProperties;

/**
 * The hero rotates on its own, so the rotation has to be visible and stoppable.
 * The active indicator segment fills over exactly the time its slide has left,
 * and the loop stops while the pointer rests on the hero, while focus is inside
 * it, while the tab is hidden and while the hero is scrolled out of view.
 * Reduced motion turns autoplay off and leaves the indicator as a static state
 * read rather than a moving bar.
 */
export function HeroFeaturedCarousel({ items }: IProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [userPaused, setUserPaused] = useState(false);
    const [interacting, setInteracting] = useState(false);
    const [inView, setInView] = useState(true);
    const [pageVisible, setPageVisible] = useState(true);
    const rootRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef({ index: -1, remaining: AUTOPLAY_DELAY, runningSince: 0 });
    const reduce = useReducedMotion();

    const count = items.length;
    const playing = !reduce && !userPaused && !interacting && inView && pageVisible && count > 1;
    const leading = items[selectedIndex] as FeaturedItem | undefined;

    const scrollTo = useCallback(
        (index: number) => {
            emblaApi?.scrollTo(index);
        },
        [emblaApi],
    );
    const scrollPrev = useCallback(() => {
        emblaApi?.scrollPrev();
    }, [emblaApi]);
    const scrollNext = useCallback(() => {
        emblaApi?.scrollNext();
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

    // One timeout per slide rather than a repeating interval, and the remaining
    // time is banked whenever the cycle stops. A pause therefore freezes the
    // clock exactly as `animation-play-state` freezes the indicator fill, so the
    // segment always shows the time the slide has genuinely left.
    useEffect(() => {
        if (!playing) return;
        const now = Date.now();
        const timer = timerRef.current;
        if (timer.index !== selectedIndex) {
            timerRef.current = {
                index: selectedIndex,
                remaining: AUTOPLAY_DELAY,
                runningSince: now,
            };
        } else {
            // Re-anchor on every run: a cycle that is running must always have a
            // clock, or the next pause banks nothing and the slide outlives the
            // indicator that says it is about to change.
            timerRef.current = {
                ...timer,
                remaining: timer.runningSince
                    ? Math.max(0, timer.remaining - (now - timer.runningSince))
                    : timer.remaining,
                runningSince: now,
            };
        }
        const id = setTimeout(() => {
            timerRef.current = { index: -1, remaining: AUTOPLAY_DELAY, runningSince: 0 };
            scrollNext();
        }, timerRef.current.remaining);
        return () => {
            clearTimeout(id);
            const current = timerRef.current;
            if (!current.runningSince) return;
            timerRef.current = {
                ...current,
                remaining: Math.max(0, current.remaining - (Date.now() - current.runningSince)),
                runningSince: 0,
            };
        };
    }, [playing, selectedIndex, scrollNext]);

    useEffect(() => {
        const onVisibility = () => setPageVisible(document.visibilityState === "visible");
        onVisibility();
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, []);

    useEffect(() => {
        const element = rootRef.current;
        if (!element || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
            threshold: 0.25,
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={rootRef}
            className="relative h-full"
            aria-roledescription="carousel"
            aria-label="Featured today"
            onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setInteracting(true);
            }}
            onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setInteracting(false);
            }}
            onFocusCapture={(event) => {
                // Only keyboard focus pauses the rotation; a pointer click on a
                // control (pressing Play, say) should do what it says.
                if ((event.target as HTMLElement).matches(":focus-visible")) setInteracting(true);
            }}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setInteracting(false);
                }
            }}
        >
            <motion.div
                className="h-full overflow-hidden"
                ref={emblaRef}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: MOTION_EASE_OUT }}
            >
                <ul className="flex touch-pan-y touch-pinch-zoom h-full w-full">
                    {(items as FeaturedItem[]).map((item, index) => (
                        <HeroFeaturedItem
                            key={item.id}
                            mediaData={item}
                            priority={index === 0}
                            isActive={index === selectedIndex}
                            slideNumber={index + 1}
                            slideCount={count}
                        />
                    ))}
                </ul>
            </motion.div>

            {count > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
                    <div className="mx-auto flex w-full max-w-[85%] items-center gap-3 pb-6">
                        <div className="pointer-events-auto hidden items-center gap-1.5 md:flex">
                            <button
                                type="button"
                                onClick={scrollPrev}
                                aria-label="Previous featured title"
                                className={controlButtonClassName}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={scrollNext}
                                aria-label="Next featured title"
                                className={controlButtonClassName}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <ol
                            className="pointer-events-auto flex items-center gap-1 md:gap-1.5"
                            style={cycleStyle}
                            aria-label="Featured titles"
                        >
                            {items.map((item, index) => {
                                const active = index === selectedIndex;
                                return (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => scrollTo(index)}
                                            aria-label={`Show featured title ${index + 1} of ${count}`}
                                            aria-current={active ? "true" : undefined}
                                            className="group flex h-6 w-5 cursor-pointer items-center focus-visible:outline-white md:w-8"
                                        >
                                            <span
                                                className={cn(
                                                    "block h-[3px] w-full overflow-hidden rounded-full bg-white/30 transition-colors",
                                                    !active && "group-hover:bg-white/60",
                                                )}
                                            >
                                                {active && (
                                                    <span
                                                        key={selectedIndex}
                                                        data-state={playing ? "running" : "paused"}
                                                        className="hero-progress block h-full w-full rounded-full bg-primary"
                                                    />
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>

                        {!reduce && (
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !userPaused;
                                    setUserPaused(next);
                                    // An explicit play press beats the pointer that is
                                    // resting on the control. Both icons stay mounted
                                    // below, so the press cannot fire a fresh enter
                                    // event that would immediately pause it again.
                                    if (!next) setInteracting(false);
                                }}
                                aria-label={
                                    userPaused
                                        ? "Start automatic slide show"
                                        : "Stop automatic slide show"
                                }
                                className={cn(
                                    controlButtonClassName,
                                    "pointer-events-auto ml-auto md:ml-0",
                                )}
                            >
                                <span
                                    aria-hidden
                                    className="relative inline-flex size-4 items-center justify-center"
                                >
                                    <Play
                                        size={16}
                                        className={cn(
                                            "absolute transition-opacity duration-150",
                                            !userPaused && "opacity-0",
                                        )}
                                    />
                                    <Pause
                                        size={16}
                                        className={cn(
                                            "absolute transition-opacity duration-150",
                                            userPaused && "opacity-0",
                                        )}
                                    />
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic="true">
                {leading ? `${selectedIndex + 1} of ${count}: ${getTitle(leading) ?? ""}` : ""}
            </p>
        </section>
    );
}
