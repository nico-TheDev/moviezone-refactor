import { describe, expect, it } from "vitest";
import {
    buildGenreBrowseUrl,
    formatGenreSelectionLabel,
    genreBrowsePath,
    genreToSlug,
    mapGenreIdsAcrossMediaType,
    parseGenreIds,
} from "../../app/utils/genre-helpers";

describe("genre-helpers", () => {
    it("genreToSlug normalizes names", () => {
        expect(genreToSlug("Sci-Fi & Fantasy")).toBe("sci-fi-and-fantasy");
        expect(genreToSlug("  Action  ")).toBe("action");
    });

    it("genreBrowsePath builds route", () => {
        expect(genreBrowsePath("movie", 28, "Action")).toBe("/movie/genre/action/28");
    });

    describe("parseGenreIds", () => {
        it("uses path id when genres param is absent", () => {
            expect(parseGenreIds("28", null)).toEqual([28]);
        });

        it("parses genres param", () => {
            expect(parseGenreIds("28", "28,35")).toEqual([28, 35]);
        });

        it("falls back to path id when genres param is invalid", () => {
            expect(parseGenreIds("28", "bad")).toEqual([28]);
        });
    });

    describe("buildGenreBrowseUrl", () => {
        const names = new Map([
            [28, "Action"],
            [35, "Comedy"],
        ]);

        it("builds single-genre path without query", () => {
            expect(buildGenreBrowseUrl("movie", [28], names)).toBe("/movie/genre/action/28");
        });

        it("appends genres param for multi-select", () => {
            expect(buildGenreBrowseUrl("movie", [28, 35], names)).toBe(
                "/movie/genre/action/28?genres=28,35",
            );
        });
    });

    describe("mapGenreIdsAcrossMediaType", () => {
        const movieNames = new Map([
            [28, "Action"],
            [35, "Comedy"],
        ]);
        const tvNames = new Map([
            [10759, "Action"],
            [10751, "Family"],
        ]);

        it("maps genres by name", () => {
            expect(mapGenreIdsAcrossMediaType([28, 35], movieNames, tvNames)).toEqual([10759]);
        });

        it("falls back to first target genre when none match", () => {
            expect(mapGenreIdsAcrossMediaType([35], movieNames, tvNames)).toEqual([10759]);
        });
    });

    describe("formatGenreSelectionLabel", () => {
        const names = new Map([
            [28, "Action"],
            [35, "Comedy"],
        ]);

        it("shows single genre name", () => {
            expect(formatGenreSelectionLabel([28], names)).toBe("Action");
        });

        it("shows first genre plus count", () => {
            expect(formatGenreSelectionLabel([28, 35], names)).toBe("Action +1");
        });
    });
});
