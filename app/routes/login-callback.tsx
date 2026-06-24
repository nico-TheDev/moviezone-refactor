import type { Route } from "./+types/login-callback";
import { useTmdbAuthCallback } from "@/hooks/useTmdbAuthCallback";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Logging in... | MovieZone" }];
}

export default function LoginCallbackPage() {
    useTmdbAuthCallback();

    return (
        <main className="min-h-[60vh] flex items-center justify-center text-white">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
    );
}
