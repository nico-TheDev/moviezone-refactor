import { useFeaturedMovies, useMovieGenres } from "@/hooks/movies.hooks";
import type { Route } from "./+types/home";
import { API } from "@/constants/api";
import useEmblaCarousel from "embla-carousel-react";
import type { MovieResult } from "@/types/tmdb";
import { StarIcon } from "lucide-react";

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
    const [emblaRef] = useEmblaCarousel();
    const { data: genreMap, isError, isPending } = useMovieGenres();

    // console.log(genreMap);

    if (!genreMap && isError) {
        return <div className="p-4 h-[90vh] bg-red-100">Error occurred while fetching genres.</div>;
    }

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

                            <div className="relative flex max-w-7xl w-full mx-auto h-full z-10 border-amber-100 border flex-col justify-center pt-50">
                                <div className=" border border-red-500">
                                    <h3 className="text-2xl">{movie.title}</h3>
                                    <p className="">
                                        <span className="inline-flex items-center">
                                            <StarIcon
                                                size={20}
                                                className="inline-block text-primary"
                                                fill="currentColor"
                                            />
                                            {movie.vote_average}
                                        </span>
                                        •<span className="">{movie.release_date?.slice(0, 4)}</span>
                                        •
                                        {/* <span className="">
                                        {movie.genre_ids &&
                                        movie.genre_ids.map((id) => {
                                            const genreName = genreMap[id] || "Unknown";
                                            return genreName;
                                            })}
                                            </span> */}
                                    </p>

                                    <p className="">{movie.overview}</p>
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

    console.log(featuredMovies);

    return (
        <main className="h-[90vh]">
            <FeaturedCarousel movies={featuredMovies} />
        </main>
    );
}
