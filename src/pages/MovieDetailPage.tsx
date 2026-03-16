import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moviesData from "@/data/movies.json";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieDetailCard from "@/components/MovieDetailCard";
import { posterByIndex } from "@/lib/posters";
import { Star } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Play, Ticket, Clock, Calendar, Globe } from "lucide-react";

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [castMembers, setCastMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const movieData = moviesData.find((m: any) => m.id === id);
      setMovie(movieData || null);
      setCastMembers(movieData?.cast_members || []);
    }
  }, [id]);

  const handleBooking = () => {
    navigate(`/booking/${id}`);
  };

  const handleTrailer = () => {
    if (movie?.trailer_url) {
      window.open(movie.trailer_url, '_blank');
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Movie Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Movie Card - No Loading */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:shadow-white/20 transition-all">
          {/* Poster */}
          <div className="relative h-72 md:h-96 lg:h-[400px] overflow-hidden">
            <img 
              src={getPosterUrl(movie)} 
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Meta badges */}
            <div className="absolute top-6 left-6 space-y-2">
              {movie.is_now_showing && <span className="bg-emerald-500 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg">NOW SHOWING</span>}
              {movie.is_coming_soon && <span className="bg-amber-400 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg border border-white/30">COMING SOON</span>}
            </div>
            
            {/* Rating */}
            <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-sm">
              <Star size={16} fill="currentColor" className="inline mr-1" />
              {movie.rating}
            </div>
            
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
            {movie.trailer_url && (
              <Button size="lg" className="w-20 h-20 rounded-full p-0 bg-white/90 hover:bg-white shadow-2xl"
              onClick={handleTrailer}>
                <Play size={24} />
              </Button>
            )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 lg:p-16 space-y-6">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              {movie.duration && (
                <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-xl border border-slate-600/50">
                  <Clock size={18} />
                  <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-xl border border-slate-600/50">
                  <Calendar size={18} />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur px-4 py-2 rounded-xl border border-slate-600/50">
                <Globe size={18} />
                <span>{Array.isArray(movie.language) ? movie.language[0] : movie.language}</span>
              </div>
            </div>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
              {movie.description}
            </p>

            <div className="flex flex-col lg:flex-row gap-4">
              {movie.is_now_showing && (
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-lg font-bold shadow-lg hover:shadow-emerald-400/50 h-14 rounded-2xl"
                  onClick={handleBooking}
                >
                  <Ticket size={20} className="mr-2" />
                  Book Tickets Now
                </Button>
              )}
              {movie.trailer_url && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 border-white/30 hover:border-white text-lg font-bold h-14 rounded-2xl backdrop-blur hover:bg-white/10"
                  onClick={handleTrailer}
                >
                  <Play size={20} className="mr-2" fill="currentColor" />
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cast Cards */}
      {castMembers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            Cast & Crew
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
            {castMembers.map((member, index) => (
              <div key={index} className="group relative bg-slate-800/40 backdrop-blur border border-slate-600/40 hover:border-blue-500/60 rounded-3xl p-6 hover:bg-slate-700/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 cursor-pointer overflow-hidden">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:shadow-indigo-400/50 group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl md:text-3xl font-black text-white drop-shadow-2xl">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white text-center mb-3 truncate group-hover:text-blue-400 transition-colors">
                  {member.name}
                </h3>
                <p className="text-slate-300 text-sm md:text-base text-center bg-slate-700/60 backdrop-blur px-4 py-2 rounded-2xl font-semibold border border-slate-600/50">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default MovieDetailPage;

