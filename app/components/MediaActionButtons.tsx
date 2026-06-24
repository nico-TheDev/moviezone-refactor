import {
    addFavorite,
    addToWatchlist,
    getAccountStates,
    removeFavorite,
    removeFromWatchlist,
} from "@/api/account.api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/components/ui/Toast";
import { Heart, ListPlus, Play } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MediaType } from "@/types/tmdb";
import { cn } from "@/utils/css-helpers";

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

    const requireAuth = (action: () => Promise<void>) => async () => {
        if (!isAuthenticated || !account) {
            showToast("Login required for this action.", { loginLink: true });
            return;
        }
        await action();
        queryClient.invalidateQueries({
            queryKey: ["accountStates", mediaType, mediaId],
        });
    };

    const toggleFavorite = requireAuth(async () => {
        if (states?.favorite) {
            await removeFavorite(account!.id, mediaType, mediaId);
            showToast("Removed from favorites.");
        } else {
            await addFavorite(account!.id, mediaType, mediaId);
            showToast("Added to favorites!");
        }
    });

    const toggleWatchlist = requireAuth(async () => {
        if (states?.watchlist) {
            await removeFromWatchlist(account!.id, mediaType, mediaId);
            showToast("Removed from watchlist.");
        } else {
            await addToWatchlist(account!.id, mediaType, mediaId);
            showToast("Added to watchlist!");
        }
    });

    return (
        <div className="flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={toggleFavorite}
                className={cn(
                    "px-4 py-2 rounded-full text-sm inline-flex items-center gap-2 border transition-colors",
                    states?.favorite
                        ? "bg-primary border-primary text-white"
                        : "border-white/30 hover:border-primary",
                )}>
                <Heart size={16} fill={states?.favorite ? "currentColor" : "none"} />
                {states?.favorite ? "Favorited" : "Add to Favorites"}
            </button>
            <button
                type="button"
                onClick={toggleWatchlist}
                className={cn(
                    "px-4 py-2 rounded-full text-sm inline-flex items-center gap-2 border transition-colors",
                    states?.watchlist
                        ? "bg-primary border-primary text-white"
                        : "border-white/30 hover:border-primary",
                )}>
                <ListPlus size={16} />
                {states?.watchlist ? "On Watchlist" : "Add to Watchlist"}
            </button>
            <button
                type="button"
                onClick={onViewTrailers}
                className="px-4 py-2 rounded-full text-sm inline-flex items-center gap-2 border border-white/30 hover:border-primary transition-colors">
                <Play size={16} />
                View Trailers
            </button>
        </div>
    );
}
