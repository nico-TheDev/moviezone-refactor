import { useMovieGenres } from "@/hooks/movies.hooks";
import type { MovieResult } from "@/types/tmdb";
import { NavLink } from "react-router";

type Props = {
    genre_ids: MovieResult["genre_ids"];
    type: "movie" | "tv";
};

function GenreList({ genre_ids, type = "movie" }: Props) {
    const { data: movieGenres, isError } = useMovieGenres();

    if (isError || !movieGenres) {
        return <div className="p-4 h-[90vh] bg-red-100">Error occurred while fetching genres.</div>;
    }

    return (
        <ul className="flex gap-1 text-sm text-gray-300">
            {genre_ids &&
                genre_ids
                    .filter((id): id is number => !!movieGenres.get(id))
                    .map((id) => {
                        const genreName = movieGenres.get(id);
                        return (
                            <li key={id}>
                                <NavLink
                                    to={`/${type}/genre/${id}`}
                                    className="px-2 py-1 text-xs font-light bg-primary text-white rounded hover:bg-primary-hover">
                                    {genreName}
                                </NavLink>
                            </li>
                        );
                    })}
        </ul>
    );
}

export default GenreList;
