import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { MOTION_EASE_OUT } from "@/lib/motion";
import { cn } from "@/utils/css-helpers";

type Option<T extends string> = { value: T; label: string };

/**
 * One control for every either/or choice (movies or TV, favorites or
 * watchlist). The selection pill slides to the chosen option, so the change of
 * state is seen as movement between the two rather than a colour swap.
 */
export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    label,
    className,
}: {
    options: readonly Option<T>[];
    value: T;
    onChange: (value: T) => void;
    label: string;
    className?: string;
}) {
    const pillId = useId();
    const reduce = useReducedMotion();

    return (
        <fieldset
            className={cn(
                "m-0 inline-flex w-fit min-w-0 items-center gap-1 rounded-full border border-line bg-surface p-1",
                className,
            )}
        >
            <legend className="sr-only">{label}</legend>
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                            active ? "text-on-primary" : "text-ink-muted hover:text-ink",
                        )}
                    >
                        {active && (
                            <motion.span
                                aria-hidden
                                layoutId={pillId}
                                className="absolute inset-0 rounded-full bg-primary-strong"
                                transition={
                                    reduce
                                        ? { duration: 0 }
                                        : { duration: 0.3, ease: MOTION_EASE_OUT }
                                }
                            />
                        )}
                        <span className="relative">{option.label}</span>
                    </button>
                );
            })}
        </fieldset>
    );
}
