
export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 mt-16">
            <div className="max-w-[85%] mx-auto py-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-sm text-gray-400">
                <div className="flex flex-col gap-2">
                    <p>
                        © {year}{" "}
                        <a
                            href="https://github.com/nico-TheDev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover">
                            Norberto Ignacio
                        </a>
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                        <a
                            href="#"
                            className="text-gray-400 hover:text-primary transition-colors">
                            Twitter
                        </a>
                        <a
                            href="#"
                            className="text-gray-400 hover:text-primary transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <p>
                        Data provided by{" "}
                        <a
                            href="https://www.themoviedb.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover">
                            The Movie Database (TMDB)
                        </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>
                </div>
            </div>
        </footer>
    );
}
