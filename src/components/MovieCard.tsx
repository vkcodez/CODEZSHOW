import { Star, Play } from "lucide-react";
import { posterByIndex} from "@/lib/posters";

interface Movie {
  [x: string]: any;
  language: string;
  id: string;
  title: string;
  genre: string;
  year?: string;
  rating: number;
  duration?: string;
  poster?: string;
  assets?: string;
  is_now_showing?: boolean;
  is_coming_soon?: boolean;
}

interface MovieCardProps {
  movie: Movie;
  index?: number;
  onClick?: () => void;
}




const MovieCard = ({ movie, onClick }: MovieCardProps) => {

  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-44 md:w-52 cursor-pointer"
    >
      {/* Poster */}
          <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-muted ring-1 ring-border/50">
          {movie && (
            <img
              src={posterByIndex(parseInt(movie?.id || '1', 10) - 1)}
              alt={movie.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 brightness-105 contrast-105 group-hover:brightness-90 hover:contrast-100"
            />
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/50">
                <Play size={18} fill="currentColor" className="text-primary-foreground ml-0.5" />
              </div>
            </div>
            {/* Rating badge */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-md rounded-full px-2 py-1 shadow-lg">
              <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-sm" />
              <span className="text-xs font-bold text-foreground drop-shadow-sm">{movie.rating}</span>
            </div>
            {/* status badges */}
            {movie.is_now_showing && (
              <div className="absolute top-2 left-2 z-10 bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded-full font-semibold shadow-md backdrop-blur-sm border border-primary/50">NOW</div>
            )}
            {movie.is_coming_soon && (
              <div className="absolute top-2 left-2 z-10 bg-secondary/90 text-foreground text-xs px-2.5 py-1 rounded-full font-semibold shadow-md border-2 border-border/50 backdrop-blur-sm">SOON</div>
            )}
          </div>

          {/* Info */}
          <div className="mt-3 px-1">
            <h3 className="text-foreground font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors line-clamp-1">{movie.title}</h3>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-muted-foreground font-medium">{Array.isArray(movie.production_company) ? movie.production_company[0] : movie.production_company}</span>
              {movie.year && <span className="text-muted-foreground font-medium">{movie.year}</span>}
            </div>
          </div>
    </div>
  );
};

export default MovieCard;
export type { Movie };
