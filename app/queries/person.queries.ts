import { getPersonCombinedCredits, getPersonDetails } from "@/api/person.api";
import { queryOptions } from "@tanstack/react-query";

export const personKeys = {
    all: ["person"] as const,
    details: (id: string) => [...personKeys.all, id] as const,
};

export const personQueries = {
    details: (id: string) =>
        queryOptions({
            queryKey: personKeys.details(id),
            queryFn: async ({ signal }) => {
                const [person, credits] = await Promise.all([
                    getPersonDetails(id, signal),
                    getPersonCombinedCredits(id, signal),
                ]);
                const seen = new Set<number>();
                const topCredits = credits.cast
                    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
                    .filter((item) => {
                        if (seen.has(item.id)) return false;
                        seen.add(item.id);
                        return true;
                    })
                    .slice(0, 10);
                return { person, credits: topCredits };
            },
        }),
};
