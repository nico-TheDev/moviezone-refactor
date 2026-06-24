import type { MovieVideo } from "@/types/tmdb";

export function pickBackgroundVideo(videos: MovieVideo[]): MovieVideo | undefined {
    return videos
        .filter((v) => v.site === "YouTube")
        .sort((a, b) => {
            const score = (v: MovieVideo) =>
                (v.official ? 100 : 0) +
                (v.type === "Trailer" ? 10 : v.type === "Teaser" ? 5 : 0) +
                (v.iso_639_1 === "en" ? 3 : 0) +
                (v.size ?? 0) / 1000;
            return score(b) - score(a);
        })[0];
}
