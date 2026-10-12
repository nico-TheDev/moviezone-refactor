import { useQuery } from "@tanstack/react-query";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { API } from "@/constants/api";
import { searchQueries } from "@/queries/search.queries";
import { cn } from "@/utils/css-helpers";
import { getTitle } from "@/utils/media-string-helpers";

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function SearchBar({ tone = "onCanvas" }: { tone?: "onImage" | "onCanvas" }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data: results, isFetching } = useQuery(searchQueries.autocomplete(debouncedQuery));

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        setOpen(false);
        navigate(`/search/${encodeURIComponent(trimmed)}`);
    };

    const handleSelect = (mediaType: "movie" | "tv", id: number) => {
        setOpen(false);
        setQuery("");
        navigate(`/media/${mediaType}/${id}`);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <search>
                <form onSubmit={handleSubmit}>
                    <div
                        className={cn(
                            "relative flex items-center rounded-full border px-3 py-2 transition-colors focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
                            tone === "onImage"
                                ? "border-white/60 bg-scrim/30 text-white backdrop-blur-sm"
                                : "border-line-strong bg-surface text-ink",
                        )}
                    >
                        {isFetching ? (
                            <Loader2 size={18} aria-hidden className="mr-2 shrink-0 animate-spin" />
                        ) : (
                            <SearchIcon size={18} aria-hidden className="mr-2 shrink-0" />
                        )}
                        <input
                            type="text"
                            aria-label="Search movies and TV shows"
                            placeholder="Search ..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            className={cn(
                                "block w-full min-w-0 bg-transparent outline-none focus-visible:outline-none sm:w-52",
                                tone === "onImage"
                                    ? "placeholder:text-white/70"
                                    : "placeholder:text-ink-muted",
                            )}
                        />
                    </div>
                </form>
            </search>
            {open && debouncedQuery.length >= 2 && results && results.length > 0 && (
                <ul className="absolute top-full left-0 right-0 min-w-[280px] mt-2 bg-surface border border-line rounded-lg shadow-popover z-[1000] overflow-hidden py-1">
                    {results.map((item) => (
                        <li key={`${item.media_type}-${item.id}`}>
                            <button
                                type="button"
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink transition-colors hover:bg-primary/15 cursor-pointer"
                                onClick={() => handleSelect(item.media_type, item.id)}
                            >
                                <div className="h-12 w-8 shrink-0 rounded-sm overflow-hidden bg-surface-muted">
                                    {item.poster_path ? (
                                        <img
                                            src={`${API.IMAGE_POSTER_URL}${item.poster_path}`}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-full flex items-center justify-center text-ink-subtle text-[10px]">
                                            —
                                        </div>
                                    )}
                                </div>
                                <span className="min-w-0 flex-1 truncate">
                                    {getTitle(item)}{" "}
                                    <span className="text-ink-muted text-xs">
                                        {item.media_type === "tv" ? "TV" : "Movie"}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
