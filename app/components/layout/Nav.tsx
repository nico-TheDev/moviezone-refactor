import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useMatches } from "react-router";
import { UserAvatar } from "@/components/UserAvatar";
import { NAV_MOVIE_LINKS, NAV_TV_LINKS } from "@/constants/lists";
import { MOTION_DURATION, MOTION_DURATION_FAST, MOTION_EASE_OUT } from "@/lib/motion";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/utils/css-helpers";
import { SearchBar } from "../SearchBar";

/**
 * Routes whose first viewport is a photograph or a trailer declare
 * `handle.navTone = "onImage"` in `app/routes.ts`. The nav floats over imagery
 * there and over the canvas everywhere else, so its text follows the backdrop,
 * not the colour scheme.
 */
type NavTone = "onImage" | "onCanvas";

function useNavTone(): NavTone {
    const matches = useMatches();
    const overImage = matches.some(
        (match) => (match.handle as { navTone?: NavTone } | undefined)?.navTone === "onImage",
    );
    return overImage ? "onImage" : "onCanvas";
}

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
        "block px-4 py-2.5 text-sm transition-colors hover:bg-primary/15 hover:text-primary-text",
        isActive ? "text-primary-text" : "text-ink",
    );

const drawerLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cn("block py-2 transition-colors hover:text-primary-text", isActive && "text-primary-text");

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
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className="inline-flex min-h-11 cursor-pointer items-center hover:text-primary-text transition-colors"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="true"
            >
                {label}
            </button>
            <AnimatePresence>
                {open && (
                    // Top padding, not margin, bridges the gap to the trigger so
                    // the pointer never leaves the item on its way into the menu.
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                        transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE_OUT }}
                        className="absolute top-full left-0 z-[1000] pt-1"
                    >
                        <ul className="bg-surface border border-line rounded-lg py-2 min-w-[180px] shadow-popover">
                            {links.map((link) => (
                                <li key={link.category}>
                                    <NavLink
                                        to={`/list/${mediaType}/${link.category}`}
                                        className={navLinkClassName}
                                        onClick={() => setOpen(false)}
                                        viewTransition
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
}

export function Nav() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const hasSession = useAuthStore((s) => s.hasSession());
    const tone = useNavTone();
    const overImage = tone === "onImage";

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
        <nav className={cn("absolute top-0 left-0 w-full z-[999]", overImage && "text-white")}>
            {overImage && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-scrim/60 via-scrim/30 to-transparent"
                />
            )}

            <div className="relative h-[10vh] max-w-[85%] w-full mx-auto flex items-center justify-between">
                <NavLink to="/" aria-label="MovieZone home" viewTransition>
                    {overImage ? (
                        <img
                            src="/img/logo.png"
                            alt="MovieZone Logo"
                            width={243}
                            height={56}
                            className="h-6 sm:h-10"
                        />
                    ) : (
                        <picture>
                            <source
                                srcSet="/img/logo-light.png"
                                media="(prefers-color-scheme: light)"
                            />
                            <img
                                src="/img/logo.png"
                                alt="MovieZone Logo"
                                width={243}
                                height={56}
                                className="h-6 sm:h-10"
                            />
                        </picture>
                    )}
                </NavLink>

                <div className="items-center gap-6 hidden md:flex">
                    <SearchBar tone={tone} />

                    <ul className="flex items-center gap-4">
                        <NavDropdown label="Movies" links={NAV_MOVIE_LINKS} mediaType="movie" />
                        <NavDropdown label="TV Shows" links={NAV_TV_LINKS} mediaType="tv" />
                    </ul>

                    <NavLink
                        to={hasSession ? "/profile" : "/login"}
                        aria-label={hasSession ? "Your profile" : "Log in"}
                        className="rounded-full"
                        viewTransition
                    >
                        <UserAvatar size={36} />
                    </NavLink>
                </div>

                <button
                    type="button"
                    className="md:hidden -mr-2 inline-flex size-11 items-center justify-center"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                >
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
                            transition={{ duration: MOTION_DURATION_FAST }}
                            className="fixed inset-0 bg-scrim/60 z-[1000] md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: MOTION_DURATION, ease: MOTION_EASE_OUT }}
                            className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-surface text-ink z-[1001] p-6 md:hidden overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-semibold">Menu</span>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Close menu"
                                    className="-mr-2 inline-flex size-11 items-center justify-center text-ink-muted hover:text-ink"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <SearchBar />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs text-ink-subtle uppercase tracking-wide mb-1">
                                        Movies
                                    </p>
                                    <ul className="space-y-2">
                                        {NAV_MOVIE_LINKS.map((link) => (
                                            <li key={link.category}>
                                                <NavLink
                                                    to={`/list/movie/${link.category}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={drawerLinkClassName}
                                                >
                                                    {link.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs text-ink-subtle uppercase tracking-wide mb-1">
                                        TV Shows
                                    </p>
                                    <ul className="space-y-2">
                                        {NAV_TV_LINKS.map((link) => (
                                            <li key={link.category}>
                                                <NavLink
                                                    to={`/list/tv/${link.category}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={drawerLinkClassName}
                                                >
                                                    {link.label}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t border-line pt-4">
                                    {hasSession ? (
                                        <NavLink
                                            to="/profile"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 py-2 hover:text-primary-text"
                                        >
                                            <UserAvatar size={28} />
                                            Profile
                                        </NavLink>
                                    ) : (
                                        <>
                                            <NavLink
                                                to="/login"
                                                onClick={() => setMobileOpen(false)}
                                                className={drawerLinkClassName}
                                            >
                                                Login
                                            </NavLink>
                                            <Link
                                                to="/login"
                                                onClick={() => setMobileOpen(false)}
                                                className="block py-2 text-ink-muted hover:text-primary-text"
                                            >
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
