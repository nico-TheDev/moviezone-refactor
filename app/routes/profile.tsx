import type { Route } from "./+types/profile";
import { MediaGridCard } from "@/components/MediaGridCard";
import {
    getFavoriteMovies,
    getFavoriteTv,
    getGuestRatedMovies,
    getGuestRatedTv,
    getRatedMovies,
    getRatedTv,
    getWatchlistMovies,
    getWatchlistTv,
} from "@/api/account.api";
import { deleteSession } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth";
import { gravatarUrl } from "@/utils/gravatar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { MediaType } from "@/types/tmdb";
import { motion } from "motion/react";

type Tab = "favorites" | "rated" | "watchlist";
type MediaTab = "movie" | "tv";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Profile | MovieZone" }];
}

function useProfileList(tab: Tab, mediaTab: MediaTab, accountId: number | null, isGuest: boolean) {
    return useInfiniteQuery({
        queryKey: ["profile", tab, mediaTab, accountId, isGuest],
        queryFn: async ({ pageParam }) => {
            if (isGuest) {
                if (tab !== "rated") return { results: [], page: 1, total_pages: 1, total_results: 0 };
                return mediaTab === "movie"
                    ? getGuestRatedMovies(pageParam)
                    : getGuestRatedTv(pageParam);
            }
            if (!accountId) {
                return { results: [], page: 1, total_pages: 1, total_results: 0 };
            }
            if (tab === "favorites") {
                return mediaTab === "movie"
                    ? getFavoriteMovies(accountId, pageParam)
                    : getFavoriteTv(accountId, pageParam);
            }
            if (tab === "watchlist") {
                return mediaTab === "movie"
                    ? getWatchlistMovies(accountId, pageParam)
                    : getWatchlistTv(accountId, pageParam);
            }
            return mediaTab === "movie"
                ? getRatedMovies(accountId, pageParam)
                : getRatedTv(accountId, pageParam);
        },
        initialPageParam: 1,
        getNextPageParam: (last) =>
            last.page < last.total_pages ? last.page + 1 : undefined,
        enabled: isGuest || !!accountId,
    });
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const mode = useAuthStore((s) => s.mode);
    const account = useAuthStore((s) => s.account);
    const logout = useAuthStore((s) => s.logout);
    const isGuest = mode === "guest";

    const [tab, setTab] = useState<Tab>("rated");
    const [mediaTab, setMediaTab] = useState<MediaTab>("movie");

    if (mode === "none") {
        return <Navigate to="/login" replace />;
    }

    const availableTabs: Tab[] = isGuest ? ["rated"] : ["favorites", "rated", "watchlist"];

    const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useProfileList(
        tab,
        mediaTab,
        account?.id ?? null,
        isGuest,
    );

    const items = useMemo(
        () =>
            data?.pages.flatMap((page) =>
                page.results.map((item) => ({
                    media: item,
                    mediaType: mediaTab as MediaType,
                })),
            ) ?? [],
        [data, mediaTab],
    );

    const sentinelRef = useInfiniteScroll(
        () => fetchNextPage(),
        !!hasNextPage,
        !!isFetchingNextPage,
    );

    const avatarSrc = account?.username
        ? gravatarUrl(`${account.username}@tmdb.local`)
        : gravatarUrl("guest@moviezone.local");

    const handleLogout = async () => {
        await deleteSession().catch(() => undefined);
        logout();
        navigate("/");
    };

    return (
        <main className="max-w-[85%] mx-auto py-24 text-white">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <img
                    src={avatarSrc}
                    alt=""
                    className="size-24 rounded-full border-2 border-primary"
                />
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold">
                        {isGuest ? "Guest User" : account?.name || account?.username}
                    </h1>
                    {!isGuest && account?.username && (
                        <p className="text-gray-400 text-sm">@{account.username}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="sm:ml-auto px-4 py-2 border border-white/20 rounded-full text-sm hover:border-primary transition-colors">
                    Logout
                </button>
            </motion.div>

            <div className="flex flex-wrap gap-2 mb-4">
                {availableTabs.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-full text-sm capitalize ${
                            tab === t ? "bg-primary text-white" : "border border-white/20"
                        }`}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 mb-8">
                {(["movie", "tv"] as const).map((mt) => (
                    <button
                        key={mt}
                        type="button"
                        onClick={() => setMediaTab(mt)}
                        className={`px-4 py-2 rounded-md text-sm capitalize ${
                            mediaTab === mt ? "bg-primary/20 text-primary" : "text-gray-400"
                        }`}>
                        {mt === "movie" ? "Movies" : "TV Shows"}
                    </button>
                ))}
            </div>

            {isPending ? (
                <div className="flex justify-center py-12">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No items in this list yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(({ media, mediaType }) => (
                        <MediaGridCard
                            key={`${mediaType}-${media.id}`}
                            media={media as Parameters<typeof MediaGridCard>[0]["media"]}
                            mediaType={mediaType}
                        />
                    ))}
                </div>
            )}
            {hasNextPage && <div ref={sentinelRef} className="h-10" />}
        </main>
    );
}
