import { useState } from "react";
import { Navigate } from "react-router";
import { createGuestSession, createRequestToken, getTmdbAuthRedirectUrl } from "@/api/auth.api";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/auth";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Login | MovieZone" }];
}

export default function LoginPage() {
    const { showToast } = useToast();
    const setGuestSession = useAuthStore((s) => s.setGuestSession);
    const mode = useAuthStore((s) => s.mode);
    const [loading, setLoading] = useState<"oauth" | "guest" | null>(null);

    if (mode !== "none") {
        return <Navigate to={mode === "guest" ? "/" : "/profile"} replace />;
    }

    const handleOAuth = async () => {
        setLoading("oauth");
        try {
            const { request_token } = await createRequestToken();
            window.location.href = getTmdbAuthRedirectUrl(request_token);
        } catch {
            showToast("Failed to start TMDB login. Check your API key.");
            setLoading(null);
        }
    };

    const handleGuest = async () => {
        setLoading("guest");
        try {
            await createGuestSession();
            setGuestSession();
            showToast("Browsing as guest. You can rate movies and TV shows.");
        } catch {
            showToast("Failed to create guest session.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-4">
            <Reveal className="max-w-md w-full bg-surface border border-line rounded-xl p-8 text-ink">
                <h1 className="text-3xl font-bold text-balance mb-2">Welcome to MovieZone</h1>
                <p className="text-ink-muted text-sm mb-8">
                    Sign in with TMDB to manage favorites and watchlists, or browse as a guest to
                    rate content.
                </p>
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleOAuth}
                        disabled={loading !== null}
                        className="w-full cursor-pointer py-3 bg-primary-strong text-on-primary hover:bg-primary-hover rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading === "oauth" ? "Redirecting..." : "Login with TMDB"}
                    </button>
                    <button
                        type="button"
                        onClick={handleGuest}
                        disabled={loading !== null}
                        className="w-full cursor-pointer py-3 border border-line-strong hover:border-primary hover:text-primary-text rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading === "guest" ? "Loading..." : "Browse as Guest"}
                    </button>
                </div>
            </Reveal>
        </main>
    );
}
