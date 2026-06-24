import { createSession } from "@/api/auth.api";
import { getAccount } from "@/api/account.api";
import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function useTmdbAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setUserSession = useAuthStore((s) => s.setUserSession);

    const requestToken = searchParams.get("request_token");
    const approved = searchParams.get("approved");
    const isOAuthCallback = requestToken !== null || approved === "false";

    useEffect(() => {
        if (!isOAuthCallback) return;

        if (approved === "false" || !requestToken) {
            navigate("/login", { replace: true });
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const { session_id } = await createSession(requestToken);
                const account = await getAccount(session_id);
                if (cancelled) return;
                setUserSession(session_id, {
                    id: account.id,
                    username: account.username,
                    name: account.name,
                });
                navigate("/profile", { replace: true });
            } catch {
                if (!cancelled) {
                    navigate("/error/authentication-failed", { replace: true });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [approved, isOAuthCallback, navigate, requestToken, setUserSession]);

    return isOAuthCallback;
}
