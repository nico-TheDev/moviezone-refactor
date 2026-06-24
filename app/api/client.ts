import { API } from "@/constants/api";

export class ApiError extends Error {
    readonly status: number;
    readonly url: string;
    readonly body?: unknown;
    readonly retryAfter?: number;

    constructor(
        message: string,
        status: number,
        url: string,
        body?: unknown,
        retryAfter?: number,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.url = url;
        this.body = body;
        this.retryAfter = retryAfter;
    }
}

type TmdbErrorBody = {
    status_message?: string;
    status_code?: number;
    message?: string;
    retryAfter?: number;
};

export async function tmdbFetch<T>(
    path: string,
    init?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
    const url = `${API.BFF_TMDB_URL}${path}`;

    let response: Response;
    try {
        response = await fetch(url, {
            ...init,
            credentials: "include",
            headers: {
                accept: "application/json",
                ...init?.headers,
            },
        });
    } catch (cause) {
        throw new ApiError("Network request failed", 0, url, cause);
    }

    if (!response.ok) {
        const body = (await response.json().catch(() => undefined)) as
            | TmdbErrorBody
            | undefined;
        const retryAfter = Number(response.headers.get("Retry-After") ?? body?.retryAfter);
        throw new ApiError(
            body?.status_message ?? body?.message ?? `Request failed with status ${response.status}`,
            response.status,
            url,
            body,
            Number.isFinite(retryAfter) ? retryAfter : undefined,
        );
    }

    try {
        return (await response.json()) as T;
    } catch (cause) {
        throw new ApiError("Failed to parse response body", response.status, url, cause);
    }
}

export async function authBffFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API.BFF_AUTH_URL}${path}`;
    const response = await fetch(url, {
        ...init,
        credentials: "include",
        headers: { accept: "application/json", ...init?.headers },
    });
    if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        throw new ApiError(
            (body as TmdbErrorBody)?.message ?? `Auth request failed: ${response.status}`,
            response.status,
            url,
            body,
        );
    }
    return response.json() as Promise<T>;
}
