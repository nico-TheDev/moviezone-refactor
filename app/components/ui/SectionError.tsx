import { getErrorMessage } from "@/utils/error-helpers";
import { cn } from "@/utils/css-helpers";

type Props = {
    error?: unknown;
    message?: string;
    onRetry?: () => void;
    className?: string;
};

export function SectionError({ error, message, onRetry, className }: Props) {
    const copy = error ? getErrorMessage(error) : null;
    const text = message ?? copy?.message ?? "This section couldn't be loaded.";

    return (
        <div
            role="alert"
            className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 py-4",
                className,
            )}>
            <span>{text}</span>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="text-primary hover:text-primary-hover font-medium underline-offset-2 hover:underline">
                    Try again
                </button>
            )}
        </div>
    );
}
