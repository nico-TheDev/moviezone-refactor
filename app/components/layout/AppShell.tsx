import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

export default function AppShell() {
    return (
        <div className="min-h-screen flex flex-col">
            <Nav />
            <div className="flex-1">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}
