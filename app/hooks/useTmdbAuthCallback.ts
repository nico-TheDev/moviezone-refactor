import { createSession } from "@/api/auth.api";
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
                const { account } = await createSession(requestToken);
                if (cancelled) return;
                setUserSession(account);
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
