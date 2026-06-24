import { formatGenreSelectionLabel } from "@/utils/genre-helpers";
import { cn } from "@/utils/css-helpers";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
            <span className="text-xs text-gray-400 uppercase tracking-wide">Genres</span>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex items-center justify-between gap-2 px-4 py-2 rounded-sm text-sm",
                    "bg-gray-900 border border-white/20 text-white hover:border-primary",
                    "focus:outline-none focus:border-primary disabled:opacity-50",
                )}
                aria-expanded={open}
                aria-haspopup="listbox">
                <span className="truncate">{label}</span>
                <ChevronDown
                    size={16}
                    className={cn("shrink-0 transition-transform", open && "rotate-180")}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-multiselectable
                    className="absolute top-full left-0 z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-md border border-white/10 bg-gray-900 py-2 shadow-lg">
                    {options.map(([id, name]) => {
                        const checked = genreIds.includes(id);
                        return (
                            <li key={id} role="option" aria-selected={checked}>
                                <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-white hover:bg-primary/20">
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
                </ul>
            )}
        </div>
    );
}
