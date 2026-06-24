import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { OfflineFallback } from "@/components/OfflineFallback";

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
    return (
        <QueryClientProvider client={queryClient}>
            <Outlet />
            <OfflineFallback />
        </QueryClientProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
            <div className="text-center max-w-md">
                <h1 className="text-4xl font-bold mb-4 text-primary">{message}</h1>
                <p className="text-gray-300 mb-8">{details}</p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover rounded-full font-medium transition-colors">
                    Return to Home
                </Link>
                {stack && (
                    <pre className="mt-8 w-full p-4 overflow-x-auto text-left text-xs text-gray-500 bg-gray-900 rounded-lg">
                        <code>{stack}</code>
                    </pre>
                )}
            </div>
        </main>
    );
}
