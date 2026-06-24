import type { MediaType } from "@/types/tmdb";

export function genreToSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function genreBrowsePath(mediaType: "movie" | "tv", id: number, name: string): string {
    return `/${mediaType}/genre/${genreToSlug(name)}/${id}`;
}

export function parseGenreIds(pathId: string, genresParam: string | null): number[] {
    if (genresParam) {
        const ids = genresParam
            .split(",")
            .map((part) => parseInt(part.trim(), 10))
            .filter((id) => !Number.isNaN(id) && id > 0);
        if (ids.length > 0) return ids;
    }

    const pathNum = parseInt(pathId, 10);
    return !Number.isNaN(pathNum) && pathNum > 0 ? [pathNum] : [];
}

export function buildGenreBrowseUrl(
    mediaType: MediaType,
    genreIds: number[],
    genreNames: Map<number, string>,
): string {
    if (genreIds.length === 0) {
        throw new Error("At least one genre is required");
    }

    const primaryId = genreIds[0]!;
    const primaryName = genreNames.get(primaryId) ?? "genre";
    const path = genreBrowsePath(mediaType, primaryId, primaryName);

    if (genreIds.length > 1) {
        return `${path}?genres=${genreIds.join(",")}`;
    }

    return path;
}

export function mapGenreIdsAcrossMediaType(
    genreIds: number[],
    fromNames: Map<number, string>,
    toGenres: Map<number, string>,
): number[] {
    const nameToTargetId = new Map<string, number>();
    for (const [id, name] of toGenres) {
        nameToTargetId.set(name.toLowerCase(), id);
    }

    const mapped: number[] = [];
    for (const id of genreIds) {
        const name = fromNames.get(id);
        if (!name) continue;
        const targetId = nameToTargetId.get(name.toLowerCase());
        if (targetId !== undefined) mapped.push(targetId);
    }

    if (mapped.length > 0) return mapped;

    const first = [...toGenres.entries()].sort((a, b) => a[1].localeCompare(b[1]))[0];
    return first ? [first[0]] : genreIds.slice(0, 1);
}

export function formatGenreSelectionLabel(
    genreIds: number[],
    genreNames: Map<number, string>,
): string {
    if (genreIds.length === 0) return "Genres";
    const firstName = genreNames.get(genreIds[0]!) ?? "Genre";
    if (genreIds.length === 1) return firstName;
    return `${firstName} +${genreIds.length - 1}`;
}

export function formatGenreTitle(
    genreIds: number[],
    genreNames: Map<number, string>,
    fallback: string,
): string {
    const names = genreIds
        .map((id) => genreNames.get(id))
        .filter((name): name is string => !!name);
    return names.length > 0 ? names.join(", ") : fallback;
}
