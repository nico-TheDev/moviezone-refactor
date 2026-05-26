import { useTrendingTop10 } from "@/hooks/media.hooks";
import { useFeaturedMovies } from "@/hooks/movies.hooks";
import { useFeaturedTvShows } from "@/hooks/tv.hooks";

export const useHomePageData = () => ({
    trending: useTrendingTop10(),
    featuredMovies: useFeaturedMovies(),
    featuredTvShows: useFeaturedTvShows(),
});
