export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 mt-16">
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-sm text-gray-400">
                <p>
                    © {year}{" "}
                    <a
                        href="https://github.com/nico-TheDev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover"
                    >
                        Norberto Ignacio
                    </a>
                </p>
                <div className="text-center md:text-right">
                    <p>
                        Data provided by{" "}
                        <a
                            href="https://www.themoviedb.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                        >
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
