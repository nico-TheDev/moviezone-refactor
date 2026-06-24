import { NAV_MOVIE_LINKS, NAV_TV_LINKS } from "@/constants/lists";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/stores/auth";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { SearchBar } from "../SearchBar";
import { motion, AnimatePresence } from "motion/react";

function NavDropdown({
    label,
    links,
    mediaType,
}: {
    label: string;
    links: readonly { label: string; category: string }[];
    mediaType: "movie" | "tv";
}) {
    const [open, setOpen] = useState(false);

    return (
        <li
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}>
            <button
                type="button"
                className="hover:text-primary transition-colors"
                onClick={() => setOpen((v) => !v)}>
                {label}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 mt-2 bg-gray-900 border border-white/10 rounded-md py-2 min-w-[160px] z-[1000]">
                        {links.map((link) => (
                            <li key={link.category}>
                                <NavLink
                                    to={`/list/${mediaType}/${link.category}`}
                                    className="block px-4 py-2 text-sm text-white hover:bg-primary/20 hover:text-primary"
                                    onClick={() => setOpen(false)}>
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </li>
    );
}

export function Nav() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const hasSession = useAuthStore((s) => s.hasSession());

    useEffect(() => {
        if (!mobileOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [mobileOpen]);

    return (
        <nav className="absolute top-0 left-0 w-full z-[999]">
            <div className="h-[10vh] max-w-[85%] w-full mx-auto flex items-center justify-between">
                <NavLink to="/">
                    <img src="/img/logo.png" alt="MovieZone Logo" className="h-6 sm:h-10" />
                </NavLink>

                <div className="items-center gap-6 text-white hidden md:flex">
                    <SearchBar />

                    <ul className="flex items-center gap-4">
                        <NavDropdown label="Movies" links={NAV_MOVIE_LINKS} mediaType="movie" />
                        <NavDropdown label="TV Shows" links={NAV_TV_LINKS} mediaType="tv" />
                    </ul>

                    <NavLink to={hasSession ? "/profile" : "/login"}>
                        <UserAvatar size={36} />
                    </NavLink>
                </div>

                <button
                    type="button"
                    className="md:hidden text-white"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu">
                    <Menu size={28} />
                </button>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-[1000] md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-gray-900 z-[1001] p-6 text-white md:hidden overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-semibold">Menu</span>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Close menu">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <SearchBar />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase mb-2">Movies</p>
                                    <ul className="space-y-2">
                                        {NAV_MOVIE_LINKS.map((link) => (
                                            <li key={link.category}>
                                                <NavLink
                                                    to={`/list/movie/${link.category}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block py-1 hover:text-primary">
                                                    {link.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase mb-2">TV Shows</p>
                                    <ul className="space-y-2">
                                        {NAV_TV_LINKS.map((link) => (
                                            <li key={link.category}>
                                                <NavLink
                                                    to={`/list/tv/${link.category}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block py-1 hover:text-primary">
                                                    {link.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    {hasSession ? (
                                        <NavLink
                                            to="/profile"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 py-2 hover:text-primary">
                                            <UserAvatar size={28} />
                                            Profile
                                        </NavLink>
                                    ) : (
                                        <>
                                            <NavLink
                                                to="/login"
                                                onClick={() => setMobileOpen(false)}
                                                className="block py-2 hover:text-primary">
                                                Login
                                            </NavLink>
                                            <Link
                                                to="/login"
                                                onClick={() => setMobileOpen(false)}
                                                className="block py-2 text-gray-400 hover:text-primary">
                                                Browse as Guest
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
