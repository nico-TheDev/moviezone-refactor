import { describe, expect, it, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth";

describe("auth store", () => {
    beforeEach(() => {
        useAuthStore.setState({ mode: "none", account: null });
    });

    it("transitions guest mode", () => {
        useAuthStore.getState().setGuestSession();
        expect(useAuthStore.getState().mode).toBe("guest");
        expect(useAuthStore.getState().hasSession()).toBe(true);
    });

    it("transitions user mode with account", () => {
        useAuthStore.getState().setUserSession({
            id: 1,
            username: "user",
            name: "User",
        });
        expect(useAuthStore.getState().isAuthenticated()).toBe(true);
        expect(useAuthStore.getState().account?.username).toBe("user");
    });

    it("logout clears state", () => {
        useAuthStore.getState().setGuestSession();
        useAuthStore.getState().logout();
        expect(useAuthStore.getState().mode).toBe("none");
    });
});
