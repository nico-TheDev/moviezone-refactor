import { API, getAppUrl } from "@/constants/api";
import { authBffFetch } from "@/api/client";
import type { AccountInfo } from "@/stores/auth";

type RequestTokenResponse = { request_token: string };
type SessionResponse = {
    account: AccountInfo;
};

export const createRequestToken = () =>
    authBffFetch<RequestTokenResponse>("/request-token");

export const createSession = (requestToken: string) =>
    authBffFetch<SessionResponse>("/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_token: requestToken }),
    });

export const createGuestSession = () =>
    authBffFetch<{ success: boolean }>("/guest", { method: "POST" });

export const deleteSession = () =>
    authBffFetch<{ success: boolean }>("/session", { method: "DELETE" });

export function getTmdbAuthRedirectUrl(requestToken: string): string {
    const redirectUrl = `${getAppUrl()}/`;
    return `${API.TMDB_AUTH_URL}/${requestToken}?redirect_to=${encodeURIComponent(redirectUrl)}`;
}
