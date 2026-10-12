import { StarIcon } from "lucide-react";
import { cn } from "@/utils/css-helpers";

/**
 * TMDB's average score, the same way everywhere: a brand star and one decimal.
 * The star carries the colour; the number inherits the surrounding text colour,
 * because the brand red is too light to carry small text on the canvas.
 */
export function Rating({
    value,
    size = 14,
    className,
}: {
    value: number | null | undefined;
    size?: number;
    className?: string;
}) {
    const rated = typeof value === "number" && value > 0;

    return (
        <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
            <StarIcon
                size={size}
                fill="currentColor"
                aria-hidden
                className="shrink-0 text-primary"
            />
            <span>
                <span className="sr-only">Rating </span>
                {rated ? value.toFixed(1) : "—"}
            </span>
        </span>
    );
}
