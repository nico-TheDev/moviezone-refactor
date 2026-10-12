import { Rating } from "@/components/ui/Rating";
import { cn } from "@/utils/css-helpers";

/**
 * The shared anatomy of every title card (grids, carousels, credits): a
 * framed image that leans in on hover, then a title and a year-and-rating
 * line. Cards opt in with the `group/card` class on their root.
 */
export function MediaThumb({
    src,
    alt,
    fallback,
    className,
}: {
    src: string | null;
    alt: string;
    fallback: string;
    className?: string;
}) {
    return (
        <div className={cn("relative overflow-hidden rounded-md bg-surface-muted", className)}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="block size-full object-cover transition-transform duration-500 ease-emphasized group-hover/card:scale-[1.04]"
                />
            ) : (
                <div className="flex size-full items-center justify-center p-2 text-center text-xs text-ink-subtle">
                    {fallback}
                </div>
            )}
        </div>
    );
}

export function MediaCaption({
    title,
    year,
    rating,
}: {
    title: string | undefined;
    year: string | number | undefined;
    rating: number | null | undefined;
}) {
    return (
        <>
            <p className="mt-2 truncate text-sm font-medium text-ink transition-colors duration-200 group-hover/card:text-primary-text">
                {title}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                {year && <span>{year}</span>}
                <Rating value={rating} size={12} />
            </div>
        </>
    );
}
