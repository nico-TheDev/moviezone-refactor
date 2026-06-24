import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { assertServerEnv } from "./env";

const TMDB_BASE = "https://api.themoviedb.org/3";

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
};

async function tmdbAuthFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const env = assertServerEnv();
    const separator = path.includes("?") ? "&" : "?";
    const url = `${TMDB_BASE}${path}${separator}api_key=${env.tmdbApiKey}`;
    const response = await fetch(url, {
        ...init,
        headers: { accept: "application/json", ...init?.headers },
    });
    if (!response.ok) {
        throw new Error(`Auth request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export function createAuthRoutes() {
    const auth = new Hono();

    auth.get("/request-token", async (c) => {
        const data = await tmdbAuthFetch<{ request_token: string }>("/authentication/token/new");
        return c.json(data);
    });

    auth.post("/session", async (c) => {
        const body = await c.req.json<{ request_token?: string }>();
        if (!body.request_token) {
            return c.json({ message: "request_token required" }, 400);
        }

        const session = await tmdbAuthFetch<{ session_id: string }>(
            "/authentication/session/new",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ request_token: body.request_token }),
            },
        );

        deleteCookie(c, "mz_guest", { path: "/" });
        setCookie(c, "mz_session", session.session_id, COOKIE_OPTS);

        const account = await fetchAccount(session.session_id);
        return c.json({ account });
    });

    auth.post("/guest", async (c) => {
        const session = await tmdbAuthFetch<{ guest_session_id: string }>(
            "/authentication/guest_session/new",
        );

        deleteCookie(c, "mz_session", { path: "/" });
        setCookie(c, "mz_guest", session.guest_session_id, COOKIE_OPTS);

        return c.json({ success: true });
    });

    auth.delete("/session", async (c) => {
        const sessionId = c.req.header("cookie")?.match(/mz_session=([^;]+)/)?.[1];
        if (sessionId) {
            const env = assertServerEnv();
            await fetch(
                `${TMDB_BASE}/authentication/session?api_key=${env.tmdbApiKey}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                    body: JSON.stringify({ session_id: sessionId }),
                },
            ).catch(() => undefined);
        }

        deleteCookie(c, "mz_session", { path: "/" });
        deleteCookie(c, "mz_guest", { path: "/" });
        return c.json({ success: true });
    });

    return auth;
}

async function fetchAccount(sessionId: string) {
    const env = assertServerEnv();
    const response = await fetch(
        `${TMDB_BASE}/account?session_id=${encodeURIComponent(sessionId)}`,
        {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${env.tmdbBearer}`,
            },
        },
    );
    if (!response.ok) {
        throw new Error("Failed to fetch account");
    }
    const account = (await response.json()) as {
        id: number;
        username: string;
        name: string;
        avatar?: {
            gravatar?: { hash?: string };
            tmdb?: { avatar_path?: string };
        };
    };

    const avatar =
        account.avatar?.gravatar?.hash || account.avatar?.tmdb?.avatar_path
            ? {
                  gravatarHash: account.avatar?.gravatar?.hash,
                  tmdbPath: account.avatar?.tmdb?.avatar_path,
              }
            : undefined;

    return {
        id: account.id,
        username: account.username,
        name: account.name,
        avatar,
    };
}
