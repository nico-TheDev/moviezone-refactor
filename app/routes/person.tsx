import type { Route } from "./+types/person";
import { MediaGridCard } from "@/components/MediaGridCard";
import { API } from "@/constants/api";
import { personQueries } from "@/queries/person.queries";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuery } from "@tanstack/react-query";

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
    const { data, isPending, isError } = useQuery(personQueries.details(params.personId));

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
        throw new Response("Person not found", { status: 404 });
    }

    const { person, credits } = data;

    return (
        <main className="max-w-[85%] mx-auto py-24 text-white">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
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
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
                    <p className="text-sm text-gray-400 mb-4">
                        Popularity: {person.popularity?.toFixed(1)}
                    </p>
                    {(person.birthday || person.place_of_birth) && (
                        <p className="text-sm text-gray-300 mb-4">
                            {person.birthday && <span>Born {person.birthday}</span>}
                            {person.birthday && person.place_of_birth && " · "}
                            {person.place_of_birth && <span>{person.place_of_birth}</span>}
                        </p>
                    )}
                    <p className="text-sm text-gray-300 leading-relaxed">{person.biography}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 bg-primary block h-8" />
                Known For
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {credits.map((credit) => (
                    <MediaGridCard
                        key={`${credit.media_type}-${credit.id}`}
                        media={credit}
                        mediaType={credit.media_type}
                    />
                ))}
            </div>
        </main>
    );
}
