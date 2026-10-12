import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
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
import { MediaGrid } from "@/components/MediaGrid";
import { UserAvatar } from "@/components/UserAvatar";
import { Reveal } from "@/components/ui/Reveal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuthStore } from "@/stores/auth";
import type { MediaType, MovieResult, TvResult } from "@/types/tmdb";
import { cn } from "@/utils/css-helpers";
import type { Route } from "./+types/profile";

type Tab = "favorites" | "rated" | "watchlist";
type MediaTab = "movie" | "tv";

const TAB_LABELS: Record<Tab, string> = {
    favorites: "Favorites",
    rated: "Rated",
    watchlist: "Watchlist",
};

const MEDIA_TAB_OPTIONS = [
    { value: "movie", label: "Movies" },
    { value: "tv", label: "TV Shows" },
] as const;

export function meta({}: Route.MetaArgs) {
    return [{ title: "Profile | MovieZone" }];
}

function useProfileList(tab: Tab, mediaTab: MediaTab, accountId: number | null, isGuest: boolean) {
    // Moving the hooks above it changes when they run. Tracked as its own bug fix, not a style question.
    // biome-ignore lint/correctness/useHookAtTopLevel: called below a `mode === "none"` early return.
    return useInfiniteQuery({
        queryKey: ["profile", tab, mediaTab, accountId, isGuest],
        queryFn: async ({ pageParam }) => {
            if (isGuest) {
                if (tab !== "rated")
                    return { results: [], page: 1, total_pages: 1, total_results: 0 };
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
        getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
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

    const {
        data,
        isPending,
        isError,
        error,
        refetch,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        // Moving the hooks above it changes when they run. Tracked as its own bug fix, not a style question.
        // biome-ignore lint/correctness/useHookAtTopLevel: called below a `mode === "none"` early return.
    } = useProfileList(tab, mediaTab, account?.id ?? null, isGuest);

    // Moving the hooks above it changes when they run. Tracked as its own bug fix, not a style question.
    // biome-ignore lint/correctness/useHookAtTopLevel: called below a `mode === "none"` early return.
    const items = useMemo(
        () =>
            data?.pages.flatMap((page) =>
                page.results.map((item) => ({
                    media: item as MovieResult | TvResult,
                    mediaType: mediaTab as MediaType,
                })),
            ) ?? [],
        [data, mediaTab],
    );

    const handleLogout = async () => {
        await deleteSession().catch(() => undefined);
        logout();
        navigate("/");
    };

    return (
        <main className="max-w-[85%] mx-auto py-24 text-ink">
            <Reveal className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <UserAvatar
                    size={120}
                    className={cn("size-24", !isGuest && "border-2 border-primary rounded-full")}
                />
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-balance">
                        {isGuest ? "Guest User" : account?.name || account?.username}
                    </h1>
                    {!isGuest && account?.username && (
                        <p className="text-ink-muted text-sm">@{account.username}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="sm:ml-auto cursor-pointer rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary-text"
                >
                    Logout
                </button>
            </Reveal>

            <Reveal className="flex flex-wrap items-center gap-3 mb-8" delay={0.06}>
                {availableTabs.length > 1 && (
                    <SegmentedControl
                        label="List"
                        options={availableTabs.map((t) => ({ value: t, label: TAB_LABELS[t] }))}
                        value={tab}
                        onChange={setTab}
                    />
                )}
                <SegmentedControl
                    label="Media type"
                    options={MEDIA_TAB_OPTIONS}
                    value={mediaTab}
                    onChange={setMediaTab}
                />
            </Reveal>

            <MediaGrid
                items={items}
                isLoading={isPending}
                isError={isError}
                error={error}
                onRetry={() => refetch()}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                fetchNextPage={() => fetchNextPage()}
                emptyMessage={`No ${mediaTab === "movie" ? "movies" : "TV shows"} in your ${TAB_LABELS[tab].toLowerCase()} list yet.`}
            />
        </main>
    );
}
