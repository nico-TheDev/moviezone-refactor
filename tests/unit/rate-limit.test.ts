import { RateLimiterMemory } from "rate-limiter-flexible";
import { describe, expect, it } from "vitest";

describe("rate limiter", () => {
    it("returns 429 behavior after threshold is exceeded", async () => {
        const limiter = new RateLimiterMemory({ points: 2, duration: 60 });

        await limiter.consume("test-ip");
        await limiter.consume("test-ip");

        await expect(limiter.consume("test-ip")).rejects.toMatchObject({
            msBeforeNext: expect.any(Number),
        });
    });
});
