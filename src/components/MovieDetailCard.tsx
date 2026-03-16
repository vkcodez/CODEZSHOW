import React from "react";
import { Star, Clock, Calendar, Globe, Play, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { posterByIndex, posterList } from "@/lib/posters";
import type { Movie } from "@/components/MovieCard";

interface MovieDetailCardProps {
  movie: Movie | any;
  index?: number;
}

 const getPosterUrl = (m?: any) => {
    const assets = m?.assets;
    if (!assets) {
      return posterByIndex(parseInt(m?.id || '1', 10));
    }
    if (assets.startsWith('/')) {
      return `/assets${assets}`;
    }
    return assets;
  };

const MovieDetailCard = ({ movie}: MovieDetailCardProps) => {
  
  return (
    <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden max-w-sm mx-auto w-full hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">

      {/* Poster */}
      <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
{movie && (
        <img 
          src={getPosterUrl(movie)}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover" 
        />
      )}

      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />


      {/* Rating - Floating */}
      <div className="absolute top-4 right-4 z-20 translate-y-2">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2.5 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2 bg-white/95 backdrop-blur-xl border">
          <Star size={16} fill="currentColor" />
          <span>{movie.rating || 1}</span>
        </div>
      </div>

      {/* Status - Floating */}
      <div className="absolute top-4 left-4 z-20 translate-y-2">
        {movie.is_now_showing && (
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-2xl bg-white/95 backdrop-blur-xl">
            NOW SHOWING
          </span>
        )}
      </div>

      {/* Play Button - Full Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 z-30 bg-black/20 backdrop-blur-sm">
        <Button className="bg-white shadow-2xl border-4 border-white/80 rounded-full w-20 h-20 p-0 hover:scale-110 backdrop-blur-xl">
          <Play size={24} fill="currentColor" />
        </Button>
      </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 relative z-10 -mt-8 bg-gradient-to-t from-slate-900/95 via-slate-900/90">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          {/* Title */}
          <h1 className="font-bold text-xl sm:text-2xl line-clamp-1 text-white drop-shadow-lg">
            {movie.title || 1}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-300">
            {movie.duration && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              </div>
            )}
            {movie.release_date && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>{movie.language}</span>
            </div>
          </div>

          {/* Genre */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {(movie.genre || []).slice(0, 3).map((g: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-slate-700/60 text-xs rounded-xl text-slate-300 font-medium border border-slate-600/50 hover:bg-slate-600/80 transition-all backdrop-blur">
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-slate-400 mt-3 line-clamp-3">
            {movie.description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {movie.is_now_showing && (
              <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-xl font-semibold h-12 shadow-emerald-500/30 border border-emerald-400/30">
                <Ticket size={18} className="mr-2" />
                Book Now
              </Button>
            )}
            {movie.trailer_url && (
              <Button variant="outline" className="flex-1 border-white/30 hover:border-white rounded-2xl font-semibold h-12 backdrop-blur-xl shadow-lg hover:shadow-white/20">
                <Play size={18} className="mr-2" />
                Trailer
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MovieDetailCard;
export type { MovieDetailCardProps };
