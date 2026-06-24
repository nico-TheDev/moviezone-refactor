import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { OfflineFallback } from "@/components/OfflineFallback";
import { registerPwa } from "@/lib/registerPwa";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { getErrorMessage } from "@/utils/error-helpers";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    { rel: "preconnect", href: "https://image.tmdb.org" },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap",
    },
    {
        rel: "icon",
        href: "/icons/favicon.ico",
    },
    { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
    { rel: "manifest", href: "/manifest.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                <meta name="theme-color" content="#e50914" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    useEffect(() => {
        registerPwa();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Outlet />
            <OfflineFallback />
        </QueryClientProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    const copy = getErrorMessage(error);
    let stack: string | undefined;

    if (import.meta.env.DEV && error && error instanceof Error) {
        stack = error.stack;
    }

    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
                    <div className="w-full max-w-md">
                        <ErrorState
                            title={copy.title}
                            message={copy.message}
                            onRetry={reset}
                        />
                        {stack && (
                            <pre className="mt-8 w-full p-4 overflow-x-auto text-left text-xs text-gray-500 bg-gray-900 rounded-lg">
                                <code>{stack}</code>
                            </pre>
                        )}
                    </div>
                </main>
            )}
        </QueryErrorResetBoundary>
    );
}
