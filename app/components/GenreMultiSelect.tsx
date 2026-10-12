import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MOTION_DURATION_FAST, MOTION_EASE_OUT } from "@/lib/motion";
import { cn } from "@/utils/css-helpers";
import { formatGenreSelectionLabel } from "@/utils/genre-helpers";

export function GenreMultiSelect({
    genreIds,
    genres,
    disabled,
    onChange,
}: {
    genreIds: number[];
    genres: Map<number, string>;
    disabled?: boolean;
    onChange: (nextIds: number[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const options = [...genres.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    const label = formatGenreSelectionLabel(genreIds, genres);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        const onPointerDown = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onPointerDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onPointerDown);
        };
    }, [open]);

    const toggleGenre = (id: number) => {
        const selected = genreIds.includes(id);
        if (selected) {
            if (genreIds.length === 1) return;
            onChange(genreIds.filter((gid) => gid !== id));
            return;
        }
        onChange([...genreIds, id]);
    };

    return (
        <div ref={rootRef} className="relative flex flex-col gap-1.5 min-w-[180px]">
            <span className="text-xs text-ink-subtle uppercase tracking-wide">Genres</span>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-full px-4 py-3 text-sm",
                    "bg-surface border border-line text-ink transition-colors hover:border-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    open && "border-primary",
                )}
                aria-expanded={open}
            >
                <span className="truncate">{label}</span>
                <ChevronDown
                    size={16}
                    className={cn(
                        "shrink-0 transition-transform duration-200 ease-emphasized",
                        open && "rotate-180",
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                        transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE_OUT }}
                        className="absolute top-full left-0 z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-lg border border-line bg-surface py-2 shadow-popover"
                    >
                        {options.map(([id, name]) => {
                            const checked = genreIds.includes(id);
                            return (
                                <li key={id}>
                                    <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-primary/15">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleGenre(id)}
                                            className="accent-primary"
                                        />
                                        {name}
                                    </label>
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
