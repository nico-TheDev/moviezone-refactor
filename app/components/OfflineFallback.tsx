import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export function OfflineFallback() {
    const [offline, setOffline] = useState(
        typeof navigator !== "undefined" ? !navigator.onLine : false,
    );

    useEffect(() => {
        const onOffline = () => setOffline(true);
        const onOnline = () => setOffline(false);
        window.addEventListener("offline", onOffline);
        window.addEventListener("online", onOnline);
        return () => {
            window.removeEventListener("offline", onOffline);
            window.removeEventListener("online", onOnline);
        };
    }, []);

    if (!offline) return null;

    return (
        <div
            role="alert"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/95 p-6 text-white">
            <div className="max-w-md text-center">
                <WifiOff className="mx-auto mb-4 text-primary" size={48} />
                <h2 className="text-2xl font-semibold mb-2">You&apos;re offline</h2>
                <p className="text-gray-300 mb-6">
                    Pages you&apos;ve visited recently may still be available from cache.
                    New pages need an internet connection.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover rounded-full font-medium transition-colors">
                    Go to Home
                </Link>
            </div>
        </div>
    );
}
