import { TmdbAuthCallbackHandler } from "@/components/TmdbAuthCallbackHandler";
import { ToastProvider } from "@/components/ui/Toast";
import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

export default function AppShell() {
    return (
        <ToastProvider>
            <TmdbAuthCallbackHandler />
            <div className="min-h-screen flex flex-col mx-auto">
                <Nav />
                <div className="flex-1">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </ToastProvider>
    );
}
