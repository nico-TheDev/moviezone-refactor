import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router";
import { MediaThumb } from "@/components/MediaCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { API } from "@/constants/api";
import type { TvShow } from "@/types/tmdb";

type Season = NonNullable<TvShow["seasons"]>[number];

export function SeasonScroll({ seasons, showId }: { seasons: Season[]; showId: number }) {
    const filtered = seasons.filter((s) => s.season_number > 0);
    const [emblaRef] = useEmblaCarousel({ dragFree: true, align: "start" });

    if (filtered.length === 0) return null;

    return (
        <Reveal as="section" when="inView" className="my-12">
            <div className="max-w-[85%] mx-auto py-6">
                <SectionHeading className="mb-8">Seasons</SectionHeading>
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4 touch-pan-y">
                        {filtered.map((season) => (
                            <Link
                                key={season.id}
                                to={`/media/tv/${showId}/season/${season.season_number}`}
                                className="group/card flex-[0_0_140px] min-w-0 shrink-0 cursor-pointer rounded-md"
                                viewTransition
                            >
                                <MediaThumb
                                    src={
                                        season.poster_path
                                            ? `${API.IMAGE_POSTER_URL}${season.poster_path}`
                                            : null
                                    }
                                    alt={season.name ?? `Season ${season.season_number}`}
                                    fallback={`S${season.season_number}`}
                                    className="aspect-[2/3]"
                                />
                                <p className="mt-2 text-sm font-medium text-ink truncate transition-colors duration-200 group-hover/card:text-primary-text">
                                    {season.name ?? `Season ${season.season_number}`}
                                </p>
                                <p className="mt-0.5 text-xs text-ink-muted">
                                    {season.episode_count} episodes
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </Reveal>
    );
}
