import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthMode = "none" | "guest" | "user";

interface AccountInfo {
    id: number;
    username: string;
    name: string;
}

interface AuthState {
    mode: AuthMode;
    sessionId: string | null;
    guestSessionId: string | null;
    account: AccountInfo | null;
    setGuestSession: (guestSessionId: string) => void;
    setUserSession: (sessionId: string, account: AccountInfo) => void;
    logout: () => void;
    getSessionId: () => string | null;
    isAuthenticated: () => boolean;
    hasSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            mode: "none",
            sessionId: null,
            guestSessionId: null,
            account: null,
            setGuestSession: (guestSessionId) =>
                set({
                    mode: "guest",
                    guestSessionId,
                    sessionId: null,
                    account: null,
                }),
            setUserSession: (sessionId, account) =>
                set({
                    mode: "user",
                    sessionId,
                    guestSessionId: null,
                    account,
                }),
            logout: () =>
                set({
                    mode: "none",
                    sessionId: null,
                    guestSessionId: null,
                    account: null,
                }),
            getSessionId: () => {
                const state = get();
                return state.sessionId ?? state.guestSessionId;
            },
            isAuthenticated: () => get().mode === "user",
            hasSession: () => get().mode !== "none",
        }),
        { name: "moviezone-auth" },
    ),
);
