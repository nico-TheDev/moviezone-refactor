import { useFeaturedMovies, useMovieGenres } from "@/hooks/movies.hooks";
import type { Route } from "./+types/home";
import { API } from "@/constants/api";
import useEmblaCarousel from "embla-carousel-react";
import type { MovieResult } from "@/types/tmdb";
import { StarIcon } from "lucide-react";
import GenreList from "@/components/GenreList";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "MovieZone" },
        { name: "description", content: "Search for movies, TV shows, people..." },
    ];
}

interface IProps {
    movies: MovieResult[];
}

function FeaturedCarousel({ movies }: IProps) {
    const [emblaRef] = useEmblaCarousel({ loop: true });

    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {movies.map((movie) => (
                        <div className="embla__slide bg-red-300 h-screen w-full" key={movie.id}>
                            <img
                                src={`${API.IMAGE_BACKDROP_URL}${movie.backdrop_path}`}
                                alt={movie.title}
                                className="absolute z-0 w-full h-full object-cover brightness-50"
                            />

                            <div className="relative flex max-w-7xl w-full mx-auto h-full z-10 flex-col justify-center pt-50">
                                <div className="p-4">
                                    <h3 className="text-4xl font-display mb-4 max-w-2xl">
                                        {movie.title}
                                    </h3>
                                    <p className="flex items-center gap-2 text-sm text-gray-300 font-light mb-2">
                                        <span className="inline-flex items-center text-primary gap-2 font-medium">
                                            <StarIcon
                                                size={20}
                                                className="inline-block text-primary"
                                                fill="currentColor"
                                            />
                                            {movie.vote_average.toFixed(2)}
                                        </span>
                                        •<span className="">{movie.release_date?.slice(0, 4)}</span>
                                        •
                                        <GenreList genre_ids={movie.genre_ids} type="movie" />
                                    </p>

                                    <p className="max-w-xl line-clamp-4 text-sm">
                                        {movie.overview}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="embla__prev">Scroll to prev</button>
            <button className="embla__next">Scroll to next</button>
        </div>
    );
}

export default function Home() {
    const { data, isPending, isError } = useFeaturedMovies();

    if (isPending) {
        return <main className="p-4 h-[90vh] bg-yellow-100">Loading...</main>;
    }

    if (isError) {
        return (
            <main className="p-4 h-[90vh] bg-red-100">
                Error occurred while fetching featured movies.
            </main>
        );
    }

    const featuredMovies = data.results.slice(0, 7) || [];

    return (
        <main className="h-[90vh]">
            <FeaturedCarousel movies={featuredMovies} />
        </main>
    );
}
