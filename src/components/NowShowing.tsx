import { useEffect, useState } from "react";
import { ChevronRight, Star, Play } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import moviesData from "@/data/movies.json";
import MovieCard from "@/components/MovieCard";
import { posterByIndex } from "@/lib/posters"; // fallback posters

const NowShowing = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const list = moviesData.filter((m: any) => m.is_now_showing).sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    setMovies(
      list.map((m) => ({ ...m, assets: posterByIndex(Number(m.id)) }))
    );
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">Now Showing</h2>
          <div className="w-12 h-0.5 bg-primary mt-1" />
        </div>
        <Link to="/movies?filter=now_showing" className="flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all">
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
{movies.map((movie ,index) => (
          <MovieCard
            key={movie.id}
            movie={{...movie, posterIndex: index}} // Pass index for unique poster assignment if needed
            onClick={() => navigate(`/movie/${movie.id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default NowShowing;
