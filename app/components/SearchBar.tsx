import { searchQueries } from "@/queries/search.queries";
import { getTitle } from "@/utils/media-string-helpers";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function SearchBar() {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data: results, isFetching } = useQuery(
        searchQueries.autocomplete(debouncedQuery),
    );

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
            <form onSubmit={handleSubmit}>
                <div className="flex items-center p-2 relative border-2 rounded-md border-white">
                    {isFetching ? (
                        <Loader2 size={20} className="mr-2 animate-spin" />
                    ) : (
                        <SearchIcon size={20} className="mr-2" />
                    )}
                    <input
                        type="text"
                        placeholder="Search ..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        className="block outline-none bg-transparent text-white w-40 sm:w-52"
                    />
                </div>
            </form>
            {open && debouncedQuery.length >= 2 && results && results.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-md shadow-lg z-[1000] overflow-hidden">
                    {results.map((item) => (
                        <li key={`${item.media_type}-${item.id}`}>
                            <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary/20 truncate"
                                onClick={() => handleSelect(item.media_type, item.id)}>
                                {getTitle(item)}{" "}
                                <span className="text-gray-400 text-xs">
                                    ({item.media_type})
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
