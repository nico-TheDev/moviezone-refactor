import type { Route } from "./+types/login";
import { createGuestSession, createRequestToken, getTmdbAuthRedirectUrl } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/components/ui/Toast";
import { Navigate } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";

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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-gray-900 border border-white/10 rounded-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome to MovieZone</h1>
                <p className="text-gray-400 text-sm mb-8">
                    Sign in with TMDB to manage favorites and watchlists, or browse as a guest to
                    rate content.
                </p>
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleOAuth}
                        disabled={loading !== null}
                        className="w-full py-3 bg-primary hover:bg-primary-hover rounded-full font-medium transition-colors disabled:opacity-50">
                        {loading === "oauth" ? "Redirecting..." : "Login with TMDB"}
                    </button>
                    <button
                        type="button"
                        onClick={handleGuest}
                        disabled={loading !== null}
                        className="w-full py-3 border border-white/20 hover:border-primary rounded-full font-medium transition-colors disabled:opacity-50">
                        {loading === "guest" ? "Loading..." : "Browse as Guest"}
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
