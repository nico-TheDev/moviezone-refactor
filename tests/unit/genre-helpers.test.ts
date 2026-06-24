import { describe, expect, it } from "vitest";
import { genreBrowsePath, genreToSlug } from "@/utils/genre-helpers";

describe("genre-helpers", () => {
    it("genreToSlug normalizes names", () => {
        expect(genreToSlug("Sci-Fi & Fantasy")).toBe("sci-fi-and-fantasy");
        expect(genreToSlug("  Action  ")).toBe("action");
    });

    it("genreBrowsePath builds route", () => {
        expect(genreBrowsePath("movie", 28, "Action")).toBe("/movie/genre/action/28");
    });
});
