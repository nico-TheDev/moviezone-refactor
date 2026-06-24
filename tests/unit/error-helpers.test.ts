import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/client";
import { getErrorMessage } from "@/utils/error-helpers";

describe("getErrorMessage", () => {
    it("maps 429 ApiError to rate-limit copy", () => {
        const error = new ApiError("Too many requests", 429, "/api/tmdb/trending", undefined, 30);
        const copy = getErrorMessage(error);
        expect(copy.title).toBe("Too many requests");
        expect(copy.message).toContain("30 seconds");
        expect(copy.isRateLimited).toBe(true);
        expect(copy.retryAfter).toBe(30);
    });

    it("maps network ApiError to connection copy", () => {
        const error = new ApiError("Network request failed", 0, "/api/tmdb/movie/1");
        const copy = getErrorMessage(error);
        expect(copy.title).toBe("Connection problem");
        expect(copy.message).toContain("couldn't reach the server");
    });

    it("maps generic Error to fallback copy", () => {
        const copy = getErrorMessage(new Error("Boom"));
        expect(copy.title).toBe("Something went wrong");
        expect(copy.message).toContain("Boom");
    });
});
