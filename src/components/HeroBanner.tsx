import { Play, Star, Clock, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import moviesData from "@/data/movies.json";
import type { Movie } from "@/components/MovieCard";
import { posterByIndex } from "@/lib/posters";

const HeroBanner = () => {
  const navigate = useNavigate();

  const getPosterUrl = (m?: any) => {
    const asset = m?.asset;
    if (!asset) {
      return posterByIndex(parseInt(m?.id || '0', 10));
    }
    if (asset.startsWith('/')) {
      return `/asset${asset}`;
    }
    return asset;
  };

  const movie = moviesData.find(m => m.is_now_showing && m.id === "1") || moviesData.find(m => m.is_now_showing) || moviesData[0];

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
{movie && (
        <img 
          src={getPosterUrl(movie)}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-sm opacity-40" 
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />

      <div className="absolute inset-0 flex items-end pb-24 md:items-center md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-8">
            {/* Poster */}
            <div className="hidden md:block w-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-border/30 flex-shrink-0">
                <img 
                  src={getPosterUrl(movie)}
                  alt={movie.title} 
                  className="w-full aspect-[2/3] object-cover" 
                />
              </div>

            {/* Info */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-xs font-medium uppercase tracking-widest">Now Showing</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl text-foreground leading-none mb-2">
                {movie?.title || "Featured Movie"}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4 mt-4">
                {(movie?.genre || []).map((g: string) => (
                  <span key={g} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-muted-foreground text-sm mb-5">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-foreground font-medium">{movie?.rating}</span>
                </div>
                {movie?.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}
                {movie?.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md line-clamp-3">
                {movie?.description}
              </p>

              <div className="flex gap-3 flex-wrap">
                {movie && (
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2 font-medium"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <Ticket size={16} /> Book Tickets
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 border-border/50 bg-secondary/50 text-foreground hover:bg-secondary"
                  onClick={() => navigate("/movies")}
                >
                  <Play size={16} fill="currentColor" className="mr-2" /> Explore Movies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;

