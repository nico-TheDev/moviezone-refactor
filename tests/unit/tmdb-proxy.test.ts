import type { Context } from "hono";
import { describe, expect, it } from "vitest";
import { injectSessionPath, sanitizeTmdbPath } from "../../server/tmdb-proxy";

function mockContext(cookies: Record<string, string>): Context {
    const cookieHeader = Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    const headers = new Headers();
    if (cookieHeader) headers.set("Cookie", cookieHeader);
    return {
        req: {
            raw: { headers },
            header: (name: string) => headers.get(name) ?? undefined,
        },
    } as unknown as Context;
}

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

describe("injectSessionPath", () => {
    it("appends session_id for user cookie on rating path", () => {
        const c = mockContext({ mz_session: "user-session-123" });
        expect(injectSessionPath("/movie/550/rating", c)).toBe(
            "/movie/550/rating?session_id=user-session-123",
        );
    });

    it("appends guest_session_id for guest cookie on rating path", () => {
        const c = mockContext({ mz_guest: "guest-session-456" });
        expect(injectSessionPath("/movie/550/rating", c)).toBe(
            "/movie/550/rating?guest_session_id=guest-session-456",
        );
    });

    it("appends guest_session_id for guest cookie on account_states path", () => {
        const c = mockContext({ mz_guest: "guest-session-456" });
        expect(injectSessionPath("/movie/550/account_states", c)).toBe(
            "/movie/550/account_states?guest_session_id=guest-session-456",
        );
    });

    it("leaves path unchanged when no session cookie", () => {
        const c = mockContext({});
        expect(injectSessionPath("/movie/550/rating", c)).toBe("/movie/550/rating");
    });

    it("does not duplicate session_id when already present", () => {
        const c = mockContext({ mz_session: "user-session-123" });
        expect(injectSessionPath("/movie/550/rating?session_id=existing", c)).toBe(
            "/movie/550/rating?session_id=existing",
        );
    });

    it("does not duplicate guest_session_id when already present", () => {
        const c = mockContext({ mz_guest: "guest-session-456" });
        expect(
            injectSessionPath("/movie/550/rating?guest_session_id=existing", c),
        ).toBe("/movie/550/rating?guest_session_id=existing");
    });

    it("prefers user session when both cookies are present", () => {
        const c = mockContext({ mz_session: "user-session-123", mz_guest: "guest-session-456" });
        expect(injectSessionPath("/movie/550/rating", c)).toBe(
            "/movie/550/rating?session_id=user-session-123",
        );
    });
});
