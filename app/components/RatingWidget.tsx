import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { rateMovie, rateTv } from "@/api/account.api";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/auth";
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
    const hasSession = useAuthStore((s) => s.hasSession());

    useEffect(() => {
        if (initialRating != null) setRating(initialRating);
    }, [initialRating]);
    const { showToast } = useToast();

    const handleRate = async (value: number) => {
        if (!hasSession) {
            showToast("Sign in or browse as guest to rate.", { loginLink: true });
            return;
        }

        try {
            if (mediaType === "movie") {
                await rateMovie(String(mediaId), value);
            } else {
                await rateTv(String(mediaId), value);
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
                        aria-label={`Rate ${value * 2} out of 10`}
                        className="cursor-pointer p-1 transition-transform duration-150 hover:scale-110 active:scale-95"
                    >
                        <StarIcon
                            size={22}
                            className={cn(
                                "transition-colors duration-150",
                                filled ? "text-primary" : "text-white/50",
                            )}
                            fill={filled ? "currentColor" : "none"}
                        />
                    </button>
                );
            })}
            {rating > 0 && (
                <span className="ml-2 text-xs text-white/80 tabular-nums">
                    Your rating: {rating}/10
                </span>
            )}
        </div>
    );
}
