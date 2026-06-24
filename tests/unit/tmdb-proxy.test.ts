import { describe, expect, it } from "vitest";
import { sanitizeTmdbPath } from "../../server/tmdb-proxy";

describe("sanitizeTmdbPath", () => {
    it("accepts valid paths", () => {
        expect(sanitizeTmdbPath("/movie/550")).toBe("/movie/550");
    });

    it("rejects path traversal", () => {
        expect(sanitizeTmdbPath("/movie/../account")).toBeNull();
    });

    it("rejects double slashes", () => {
        expect(sanitizeTmdbPath("/movie//550")).toBeNull();
    });

    it("preserves query strings", () => {
        expect(sanitizeTmdbPath("/movie/550?append_to_response=videos")).toBe(
            "/movie/550?append_to_response=videos",
        );
    });
});
