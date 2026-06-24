import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError, tmdbFetch } from "@/api/client";

describe("tmdbFetch", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("returns parsed JSON on success", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: 1 }),
            }),
        );

        const data = await tmdbFetch<{ id: number }>("/movie/1");
        expect(data.id).toBe(1);
    });

    it("throws ApiError on HTTP error", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                headers: { get: () => null },
                json: async () => ({ status_message: "Not found" }),
            }),
        );

        await expect(tmdbFetch("/movie/0")).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError on network failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

        await expect(tmdbFetch("/movie/1")).rejects.toMatchObject({ status: 0 });
    });
});
