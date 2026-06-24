import { API, getAppUrl } from "@/constants/api";

type RequestTokenResponse = { success: boolean; request_token: string };
type SessionResponse = { success: boolean; session_id: string };
type GuestSessionResponse = { success: boolean; guest_session_id: string };

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const separator = path.includes("?") ? "&" : "?";
    const url = `${API.BASE_URL}${path}${separator}api_key=${API.API_KEY}`;
    const response = await fetch(url, {
        ...init,
        headers: { accept: "application/json", ...init?.headers },
    });
    if (!response.ok) {
        throw new Error(`Auth request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export const createRequestToken = () =>
    authFetch<RequestTokenResponse>("/authentication/token/new");

export const createSession = (requestToken: string) =>
    authFetch<SessionResponse>("/authentication/session/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_token: requestToken }),
    });

export const createGuestSession = () =>
    authFetch<GuestSessionResponse>("/authentication/guest_session/new");

export function getTmdbAuthRedirectUrl(requestToken: string): string {
    // Use the app root so static hosts (S3/CloudFront) serve index.html.
    // Deep paths like /login/callback return 403 when no SPA fallback is configured.
    const redirectUrl = `${getAppUrl()}/`;
    return `${API.TMDB_AUTH_URL}/${requestToken}?redirect_to=${encodeURIComponent(redirectUrl)}`;
}
