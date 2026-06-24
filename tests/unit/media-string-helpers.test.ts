import { describe, expect, it } from "vitest";
import {
    assertMediaType,
    getReleaseYear,
    getTitle,
    isMovieResult,
} from "@/utils/media-string-helpers";

describe("media-string-helpers", () => {
    it("assertMediaType accepts movie and tv", () => {
        expect(assertMediaType("movie")).toBe("movie");
        expect(assertMediaType("tv")).toBe("tv");
    });

    it("assertMediaType throws for invalid type", () => {
        expect(() => assertMediaType("person")).toThrow();
    });

    it("getTitle returns title or name", () => {
        expect(getTitle({ title: "Inception", id: 1 } as never)).toBe("Inception");
        expect(getTitle({ name: "Breaking Bad", id: 2 } as never)).toBe("Breaking Bad");
    });

    it("getReleaseYear extracts year", () => {
        expect(getReleaseYear({ title: "Inception", release_date: "2010-07-16", id: 1 } as never)).toBe("2010");
        expect(getReleaseYear({ name: "Breaking Bad", first_air_date: "2008-01-20", id: 2 } as never)).toBe("2008");
    });

    it("isMovieResult discriminates", () => {
        expect(isMovieResult({ title: "A", id: 1 } as never)).toBe(true);
        expect(isMovieResult({ name: "B", id: 2 } as never)).toBe(false);
    });
});
