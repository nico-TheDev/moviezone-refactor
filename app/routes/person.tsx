import type { Route } from "./+types/person";
import { MediaGridCard } from "@/components/MediaGridCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { API } from "@/constants/api";
import { personQueries } from "@/queries/person.queries";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import type { MovieResult, TvResult } from "@/types/tmdb";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function PersonBlock({ children, index }: { children: ReactNode; index: number }) {
    const reduce = useReducedMotion();
    if (reduce) return <>{children}</>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: index * 0.07 }}>
            {children}
        </motion.div>
    );
}

function CreditCard({
    credit,
    index,
}: {
    credit: (MovieResult | TvResult) & { media_type: "movie" | "tv" };
    index: number;
}) {
    const reduce = useReducedMotion();
    const card = <MediaGridCard media={credit} mediaType={credit.media_type} />;

    if (reduce) return card;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: index * 0.04 }}>
            {card}
        </motion.div>
    );
}

export function meta({ params }: Route.MetaArgs) {
    const data = queryClient.getQueryData(personQueries.details(params.personId).queryKey);
    return [
        {
            title: data?.person?.name
                ? `${data.person.name} | MovieZone`
                : "Person | MovieZone",
        },
    ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    await queryClient.ensureQueryData(personQueries.details(params.personId));
    return null;
}

export default function PersonPage({ params }: Route.ComponentProps) {
    const reduce = useReducedMotion();
    const { data, isPending, isError, error, refetch } = useQuery(personQueries.details(params.personId));

    if (isPending) {
        return (
            <main className="max-w-[85%] mx-auto py-24">
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="size-48 rounded-full shrink-0" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </main>
        );
    }

    if (isError || !data) {
        return (
            <main className="min-h-screen bg-gray-950 py-24">
                <ErrorState
                    title="Person not found"
                    error={error}
                    onRetry={() => refetch()}
                />
            </main>
        );
    }

    const { person, credits } = data;
    let blockIndex = 0;

    const profilePhoto = (
        <div className="size-48 rounded-full overflow-hidden bg-gray-900 shrink-0">
            {person.profile_path ? (
                <img
                    src={`${API.IMAGE_PROFILE_URL}${person.profile_path}`}
                    alt={person.name ?? ""}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No photo
                </div>
            )}
        </div>
    );

    return (
        <main className="max-w-[85%] mx-auto py-24 text-white">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {reduce ? (
                    profilePhoto
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}>
                        {profilePhoto}
                    </motion.div>
                )}

                <div className="flex-1">
                    <PersonBlock index={blockIndex++}>
                        <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
                    </PersonBlock>

                    <PersonBlock index={blockIndex++}>
                        <p className="text-sm text-gray-400 mb-4">
                            Popularity: {person.popularity?.toFixed(1)}
                        </p>
                    </PersonBlock>

                    {(person.birthday || person.place_of_birth) && (
                        <PersonBlock index={blockIndex++}>
                            <p className="text-sm text-gray-300 mb-4">
                                {person.birthday && <span>Born {person.birthday}</span>}
                                {person.birthday && person.place_of_birth && " · "}
                                {person.place_of_birth && <span>{person.place_of_birth}</span>}
                            </p>
                        </PersonBlock>
                    )}

                    <PersonBlock index={blockIndex++}>
                        <p className="text-sm text-gray-300 leading-relaxed">{person.biography}</p>
                    </PersonBlock>
                </div>
            </div>

            <AnimatedSection className="mb-6" delay={0.05}>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="w-1 bg-primary block h-8" />
                    Known For
                </h2>
            </AnimatedSection>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {credits.map((credit, index) => (
                    <CreditCard
                        key={`${credit.media_type}-${credit.id}`}
                        credit={credit}
                        index={index}
                    />
                ))}
            </div>
        </main>
    );
}
