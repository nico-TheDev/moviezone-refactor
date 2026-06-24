import { AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { getErrorMessage } from "@/utils/error-helpers";
import { cn } from "@/utils/css-helpers";

type Props = {
    title?: string;
    message?: string;
    error?: unknown;
    onRetry?: () => void;
    homeHref?: string;
    layout?: "page" | "section";
    className?: string;
};

export function ErrorState({
    title,
    message,
    error,
    onRetry,
    homeHref = "/",
    layout = "page",
    className,
}: Props) {
    const copy = error ? getErrorMessage(error) : null;
    const resolvedTitle = title ?? copy?.title ?? "Something went wrong";
    const resolvedMessage =
        message ?? copy?.message ?? "An unexpected error occurred. Please try again.";

    const isSection = layout === "section";

    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center justify-center text-center text-white",
                isSection ? "py-12 px-4" : "min-h-[50vh] p-6",
                className,
            )}>
            <AlertCircle
                className={cn("text-primary mb-4", isSection ? "size-8" : "size-12")}
                aria-hidden
            />
            <h2 className={cn("font-semibold mb-2", isSection ? "text-lg" : "text-2xl")}>
                {resolvedTitle}
            </h2>
            <p className={cn("text-gray-300 max-w-md", isSection ? "text-sm mb-4" : "mb-6")}>
                {resolvedMessage}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="px-5 py-2.5 bg-primary hover:bg-primary-hover rounded-full font-medium transition-colors text-sm">
                        Try again
                    </button>
                )}
                {!isSection && homeHref && (
                    <Link
                        to={homeHref}
                        className="px-5 py-2.5 border border-gray-600 hover:border-gray-400 rounded-full font-medium transition-colors text-sm">
                        Return to Home
                    </Link>
                )}
            </div>
        </div>
    );
}
