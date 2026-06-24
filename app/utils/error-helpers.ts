import { ApiError } from "@/api/client";
import { isRouteErrorResponse } from "react-router";

export type ErrorCopy = {
    title: string;
    message: string;
    isRateLimited?: boolean;
    retryAfter?: number;
    isOffline?: boolean;
};

function isOffline(): boolean {
    return typeof navigator !== "undefined" && !navigator.onLine;
}

export function getErrorMessage(error: unknown): ErrorCopy {
    const offline = isOffline();
    const offlineHint = offline
        ? " You may still be able to browse cached pages while offline."
        : "";

    if (error instanceof ApiError) {
        if (error.status === 429) {
            return {
                title: "Too many requests",
                message: error.retryAfter
                    ? `Please wait ${error.retryAfter} seconds before trying again.${offlineHint}`
                    : `Please wait a moment before trying again.${offlineHint}`,
                isRateLimited: true,
                retryAfter: error.retryAfter,
                isOffline: offline,
            };
        }

        if (error.status === 0) {
            return {
                title: "Connection problem",
                message: `We couldn't reach the server.${offlineHint}`,
                isOffline: offline,
            };
        }

        if (error.status === 404) {
            return {
                title: "Not found",
                message: error.message || "The requested content could not be found.",
                isOffline: offline,
            };
        }

        return {
            title: "Something went wrong",
            message: `${error.message}${offlineHint}`,
            isOffline: offline,
        };
    }

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return {
                title: "Page not found",
                message: "The requested page could not be found.",
                isOffline: offline,
            };
        }

        return {
            title: "Something went wrong",
            message: error.statusText || `Request failed with status ${error.status}.${offlineHint}`,
            isOffline: offline,
        };
    }

    if (error instanceof Error) {
        return {
            title: "Something went wrong",
            message: `${error.message}${offlineHint}`,
            isOffline: offline,
        };
    }

    return {
        title: "Something went wrong",
        message: `An unexpected error occurred.${offlineHint}`,
        isOffline: offline,
    };
}
