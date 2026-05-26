import { API } from "@/constants/api";

export class ApiError extends Error {
    readonly status: number;
    readonly url: string;
    readonly body?: unknown;

    constructor(message: string, status: number, url: string, body?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.url = url;
        this.body = body;
    }
}

type TmdbErrorBody = {
    status_message?: string;
    status_code?: number;
};

export async function tmdbFetch<T>(
    path: string,
    init?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
    const url = `${API.BASE_URL}${path}`;

    let response: Response;
    try {
        response = await fetch(url, {
            ...init,
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${API.API_TOKEN}`,
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
        throw new ApiError(
            body?.status_message ?? `Request failed with status ${response.status}`,
            response.status,
            url,
            body,
        );
    }

    try {
        return (await response.json()) as T;
    } catch (cause) {
        throw new ApiError("Failed to parse response body", response.status, url, cause);
    }
}
