import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { MediaGrid } from "@/components/MediaGrid";
import { ErrorState } from "@/components/ui/ErrorState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { API } from "@/constants/api";
import { MOTION_EASE_OUT } from "@/lib/motion";
import { queryClient } from "@/lib/queryClient";
import { personQueries } from "@/queries/person.queries";
import type { Route } from "./+types/person";

export function meta({ params }: Route.MetaArgs) {
    const data = queryClient.getQueryData(personQueries.details(params.personId).queryKey);
    return [
        {
            title: data?.person?.name ? `${data.person.name} | MovieZone` : "Person | MovieZone",
        },
    ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    await queryClient.ensureQueryData(personQueries.details(params.personId));
    return null;
}

export default function PersonPage({ params }: Route.ComponentProps) {
    const reduce = useReducedMotion();
    const { data, isPending, isError, error, refetch } = useQuery(
        personQueries.details(params.personId),
    );

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
            <main className="min-h-screen bg-canvas py-24">
                <ErrorState title="Person not found" error={error} onRetry={() => refetch()} />
            </main>
        );
    }

    const { person, credits } = data;
    let blockIndex = 0;

    const profilePhoto = (
        <div className="size-48 rounded-full overflow-hidden bg-surface-muted shrink-0">
            {person.profile_path ? (
                <img
                    src={`${API.IMAGE_PROFILE_URL}${person.profile_path}`}
                    alt={person.name ?? ""}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-subtle">
                    No photo
                </div>
            )}
        </div>
    );

    return (
        <main className="max-w-[85%] mx-auto py-24 text-ink">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {reduce ? (
                    profilePhoto
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: MOTION_EASE_OUT }}
                    >
                        {profilePhoto}
                    </motion.div>
                )}

                <div className="flex-1">
                    <Reveal delay={blockIndex++ * 0.06}>
                        <h1 className="text-3xl md:text-4xl font-bold text-balance mb-2">
                            {person.name}
                        </h1>
                    </Reveal>

                    <Reveal delay={blockIndex++ * 0.06}>
                        <p className="text-sm text-ink-muted mb-4">
                            Popularity: {person.popularity?.toFixed(1)}
                        </p>
                    </Reveal>

                    {(person.birthday || person.place_of_birth) && (
                        <Reveal delay={blockIndex++ * 0.06}>
                            <p className="text-sm text-ink-muted mb-4">
                                {person.birthday && <span>Born {person.birthday}</span>}
                                {person.birthday && person.place_of_birth && " · "}
                                {person.place_of_birth && <span>{person.place_of_birth}</span>}
                            </p>
                        </Reveal>
                    )}

                    <Reveal delay={blockIndex++ * 0.06}>
                        <p className="max-w-prose text-sm text-ink-muted leading-relaxed">
                            {person.biography}
                        </p>
                    </Reveal>
                </div>
            </div>

            <Reveal when="inView" className="mb-6">
                <SectionHeading>Known For</SectionHeading>
            </Reveal>

            <MediaGrid
                items={credits.map((credit) => ({ media: credit, mediaType: credit.media_type }))}
                emptyMessage="No credits listed."
            />
        </main>
    );
}
