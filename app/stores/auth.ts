import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthMode = "none" | "guest" | "user";

export interface AccountAvatar {
    gravatarHash?: string;
    tmdbPath?: string;
}

export interface AccountInfo {
    id: number;
    username: string;
    name: string;
    avatar?: AccountAvatar;
}

interface AuthState {
    mode: AuthMode;
    account: AccountInfo | null;
    setGuestSession: () => void;
    setUserSession: (account: AccountInfo) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    hasSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            mode: "none",
            account: null,
            setGuestSession: () =>
                set({
                    mode: "guest",
                    account: null,
                }),
            setUserSession: (account) =>
                set({
                    mode: "user",
                    account,
                }),
            logout: () =>
                set({
                    mode: "none",
                    account: null,
                }),
            isAuthenticated: () => get().mode === "user",
            hasSession: () => get().mode !== "none",
        }),
        { name: "moviezone-auth" },
    ),
);
