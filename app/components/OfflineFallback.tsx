import { WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "moviezone-offline-banner-dismissed";

export function OfflineFallback() {
    const [offline, setOffline] = useState(
        typeof navigator !== "undefined" ? !navigator.onLine : false,
    );
    const [dismissed, setDismissed] = useState(() => {
        if (typeof sessionStorage === "undefined") return false;
        return sessionStorage.getItem(DISMISS_KEY) === "1";
    });

    useEffect(() => {
        const onOffline = () => setOffline(true);
        const onOnline = () => {
            setOffline(false);
            setDismissed(false);
            sessionStorage.removeItem(DISMISS_KEY);
        };
        window.addEventListener("offline", onOffline);
        window.addEventListener("online", onOnline);
        return () => {
            window.removeEventListener("offline", onOffline);
            window.removeEventListener("online", onOnline);
        };
    }, []);

    const dismiss = () => {
        setDismissed(true);
        sessionStorage.setItem(DISMISS_KEY, "1");
    };

    if (!offline || dismissed) return null;

    return (
        <div
            role="status"
            className="fixed bottom-0 inset-x-0 z-[9999] flex items-center gap-3 bg-gray-900/95 border-t border-gray-700 text-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
            <WifiOff className="shrink-0 text-primary" size={20} aria-hidden />
            <p className="flex-1 text-sm text-gray-200">
                You&apos;re offline — cached pages may still work.
            </p>
            <button
                type="button"
                onClick={dismiss}
                className="shrink-0 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Dismiss offline notice">
                <X size={18} />
            </button>
        </div>
    );
}
