import { useTmdbAuthCallback } from "@/hooks/useTmdbAuthCallback";

export function TmdbAuthCallbackHandler() {
    const isOAuthCallback = useTmdbAuthCallback();

    if (!isOAuthCallback) return null;

    return (
        <main className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 text-white">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
    );
}
