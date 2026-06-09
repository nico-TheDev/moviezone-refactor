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
