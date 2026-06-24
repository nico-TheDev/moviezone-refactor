import { API } from "@/constants/api";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { TvShow } from "@/types/tmdb";
import useEmblaCarousel from "embla-carousel-react";

type Season = NonNullable<TvShow["seasons"]>[number];

export function SeasonScroll({ seasons }: { seasons: Season[] }) {
    const filtered = seasons.filter((s) => s.season_number > 0);
    const [emblaRef] = useEmblaCarousel({ dragFree: true, align: "start" });

    if (filtered.length === 0) return null;

    return (
        <AnimatedSection className="my-12" delay={0.05}>
            <div className="max-w-[85%] mx-auto py-6">
                <h4 className="text-2xl font-bold mb-8 flex items-center gap-2 text-white">
                    <span className="inline-block w-1 h-10 bg-primary" />
                    Seasons
                </h4>
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4 touch-pan-y">
                        {filtered.map((season) => (
                            <div
                                key={season.id}
                                className="flex-[0_0_140px] min-w-0 shrink-0">
                                <div className="aspect-[2/3] rounded-md overflow-hidden bg-gray-900 mb-2">
                                    {season.poster_path ? (
                                        <img
                                            src={`${API.IMAGE_POSTER_URL}${season.poster_path}`}
                                            alt={season.name ?? `Season ${season.season_number}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs p-2 text-center">
                                            S{season.season_number}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-white truncate">
                                    {season.name ?? `Season ${season.season_number}`}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {season.episode_count} episodes
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
}
