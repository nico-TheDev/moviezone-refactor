import { describe, expect, it } from "vitest";
import { pickBackgroundVideo } from "@/utils/video-helpers";
import type { MovieVideo } from "@/types/tmdb";

describe("pickBackgroundVideo", () => {
    it("prefers official English trailer", () => {
        const videos: MovieVideo[] = [
            {
                id: "1",
                key: "a",
                site: "YouTube",
                type: "Teaser",
                official: false,
                iso_639_1: "en",
                size: 720,
            },
            {
                id: "2",
                key: "b",
                site: "YouTube",
                type: "Trailer",
                official: true,
                iso_639_1: "en",
                size: 1080,
            },
        ];

        expect(pickBackgroundVideo(videos)?.key).toBe("b");
    });
});
