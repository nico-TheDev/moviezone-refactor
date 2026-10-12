import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ListPlus, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
    addFavorite,
    addToWatchlist,
    getAccountStates,
    removeFavorite,
    removeFromWatchlist,
} from "@/api/account.api";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/auth";
import type { MediaType } from "@/types/tmdb";
import { cn } from "@/utils/css-helpers";

const actionClassName =
    "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors";
const idleClassName = "border-white/40 bg-scrim/25 text-white backdrop-blur-sm hover:border-white";
const activeClassName = "border-primary-strong bg-primary-strong text-on-primary";

/**
 * The icon pops when its state flips, so the press is acknowledged before the
 * toast arrives. The first settled value (including the account state loading
 * in) never pops: nothing was pressed.
 */
function StateIcon({ on, children }: { on: boolean | undefined; children: ReactNode }) {
    const reduce = useReducedMotion();
    const previous = useRef(on);
    const [pops, setPops] = useState(0);

    useEffect(() => {
        if (previous.current !== undefined && previous.current !== on) setPops((n) => n + 1);
        previous.current = on;
    }, [on]);

    if (reduce || pops === 0) return <span className="inline-flex">{children}</span>;

    return (
        <motion.span
            key={pops}
            className="inline-flex"
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 1.25, 1] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            {children}
        </motion.span>
    );
}

export function MediaActionButtons({
    mediaType,
    mediaId,
    onViewTrailers,
}: {
    mediaType: MediaType;
    mediaId: number;
    onViewTrailers: () => void;
}) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
    const account = useAuthStore((s) => s.account);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const { data: states } = useQuery({
        queryKey: ["accountStates", mediaType, mediaId],
        queryFn: () => getAccountStates(mediaType, String(mediaId)),
        enabled: isAuthenticated,
    });

    const requireAuth = (action: (account: { id: number }) => Promise<void>) => async () => {
        if (!isAuthenticated || !account) {
            showToast("Login required for this action.", { loginLink: true });
            return;
        }
        await action(account);
        queryClient.invalidateQueries({
            queryKey: ["accountStates", mediaType, mediaId],
        });
    };

    const toggleFavorite = requireAuth(async (account) => {
        if (states?.favorite) {
            await removeFavorite(account.id, mediaType, mediaId);
            showToast("Removed from favorites.");
        } else {
            await addFavorite(account.id, mediaType, mediaId);
            showToast("Added to favorites!");
        }
    });

    const toggleWatchlist = requireAuth(async (account) => {
        if (states?.watchlist) {
            await removeFromWatchlist(account.id, mediaType, mediaId);
            showToast("Removed from watchlist.");
        } else {
            await addToWatchlist(account.id, mediaType, mediaId);
            showToast("Added to watchlist!");
        }
    });

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={toggleFavorite}
                aria-pressed={!!states?.favorite}
                className={cn(actionClassName, states?.favorite ? activeClassName : idleClassName)}
            >
                <StateIcon on={states?.favorite}>
                    <Heart size={16} fill={states?.favorite ? "currentColor" : "none"} />
                </StateIcon>
                {states?.favorite ? "Favorited" : "Add to Favorites"}
            </button>
            <button
                type="button"
                onClick={toggleWatchlist}
                aria-pressed={!!states?.watchlist}
                className={cn(actionClassName, states?.watchlist ? activeClassName : idleClassName)}
            >
                <StateIcon on={states?.watchlist}>
                    <ListPlus size={16} />
                </StateIcon>
                {states?.watchlist ? "On Watchlist" : "Add to Watchlist"}
            </button>
            <button
                type="button"
                onClick={onViewTrailers}
                className={cn(actionClassName, idleClassName)}
            >
                <Play size={16} />
                View Trailers
            </button>
        </div>
    );
}
