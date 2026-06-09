import { rateMovie, rateTv } from "@/api/account.api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/components/ui/Toast";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import type { MediaType } from "@/types/tmdb";
import { cn } from "@/utils/css-helpers";

export function RatingWidget({
    mediaType,
    mediaId,
    initialRating,
}: {
    mediaType: MediaType;
    mediaId: number;
    initialRating?: number;
}) {
    const [rating, setRating] = useState(initialRating ?? 0);
    const [hover, setHover] = useState(0);
    const getSessionId = useAuthStore((s) => s.getSessionId);
    const hasSession = useAuthStore((s) => s.hasSession());
    const { showToast } = useToast();

    const handleRate = async (value: number) => {
        if (!hasSession) {
            showToast("Sign in or browse as guest to rate.", { loginLink: true });
            return;
        }
        const sessionId = getSessionId();
        if (!sessionId) return;

        try {
            if (mediaType === "movie") {
                await rateMovie(String(mediaId), sessionId, value);
            } else {
                await rateTv(String(mediaId), sessionId, value);
            }
            setRating(value);
            showToast("Rating saved!");
        } catch {
            showToast("Failed to save rating.");
        }
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                const filled = value <= (hover || rating);
                return (
                    <button
                        key={value}
                        type="button"
                        onMouseEnter={() => setHover(value)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => handleRate(value * 2)}
                        className="p-0.5">
                        <StarIcon
                            size={22}
                            className={cn(
                                "transition-colors",
                                filled ? "text-primary" : "text-gray-500",
                            )}
                            fill={filled ? "currentColor" : "none"}
                        />
                    </button>
                );
            })}
            {rating > 0 && (
                <span className="text-xs text-gray-400 ml-2">Your rating: {rating}/10</span>
            )}
        </div>
    );
}
