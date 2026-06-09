import type { Route } from "./+types/login-callback";
import { createSession } from "@/api/auth.api";
import { getAccount } from "@/api/account.api";
import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Logging in... | MovieZone" }];
}

export default function LoginCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setUserSession = useAuthStore((s) => s.setUserSession);

    useEffect(() => {
        const requestToken = searchParams.get("request_token");
        const approved = searchParams.get("approved");

        if (approved === "false") {
            navigate("/login", { replace: true });
            return;
        }

        if (!requestToken) {
            navigate("/login", { replace: true });
            return;
        }

        (async () => {
            try {
                const { session_id } = await createSession(requestToken);
                const account = await getAccount(session_id);
                setUserSession(session_id, {
                    id: account.id,
                    username: account.username,
                    name: account.name,
                });
                navigate("/profile", { replace: true });
            } catch {
                navigate("/error/authentication-failed", { replace: true });
            }
        })();
    }, [searchParams, navigate, setUserSession]);

    return (
        <main className="min-h-[60vh] flex items-center justify-center text-white">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
    );
}
