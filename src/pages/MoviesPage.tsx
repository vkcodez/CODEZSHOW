import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import moviesData from "@/data/movies.json";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MovieCard from "@/components/MovieCard";
import { Star, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { posterByIndex ,posterList } from "@/lib/posters"; // fallback images and whole list for empty-state cards
import type { Movie } from "@/components/MovieCard";
import TrailersSection from "@/components/TrailersSection";
import type { Database } from "@/integrations/supabase/types";
import Index from "./Index";


const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Crime", "Mythology"];
const LANGUAGES = ["Hindi", "English", "Telugu", "Tamil", "Malayalam", "Kannada"];

const MoviesPage = () => {
const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [filter, setFilter] = useState<"all" | "now_showing" | "coming_soon">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

const fetchMovies = () => {
    setLoading(true);
    const list = moviesData.map((m: any) => ({
      id: m.id,
      title: m.title,
      genre: m.genre?.[0] || '',
      language: m.language || "",
      rating: Number(m.rating || 0),
      assets: posterByIndex(Number(m.id)),
      is_now_showing: !!m.is_now_showing,
      is_coming_soon: !!m.is_coming_soon,
    }));
    setMovies(list);
    setLoading(false);
  };

  const filteredMovies = useMemo(() => movies.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedGenres.length > 0 && !selectedGenres.some((g) => m.genre.includes(g))) return false;
    if (selectedLanguage && m.language !== selectedLanguage) return false;
    if (filter === "now_showing" && !m.is_now_showing) return false;
    if (filter === "coming_soon" && !m.is_coming_soon) return false;
    return true;
  }), [movies, search, selectedGenres, selectedLanguage, filter]);

  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const clearFilters = () => { setSelectedGenres([]); setSelectedLanguage(""); setFilter("all"); setSearch(""); };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="py-8">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">Movies</h1>
          <p className="text-muted-foreground">Discover and book your next cinematic adventure</p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..." className="pl-10 bg-secondary border-border rounded-xl" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="rounded-xl gap-2">
            <SlidersHorizontal size={16} /> Filters
            {(selectedGenres.length > 0 || selectedLanguage) && (
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {selectedGenres.length + (selectedLanguage ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "now_showing", "coming_soon"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {f === "all" ? "All Movies" : f === "now_showing" ? "Now Showing" : "Coming Soon"}
            </button>
          ))}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-primary hover:underline flex items-center gap-1">
                <X size={14} /> Clear all
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Genre</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button key={g} onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                      selectedGenres.includes(g) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Language</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} onClick={() => setSelectedLanguage(selectedLanguage === l ? "" : l)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                      selectedLanguage === l ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-muted-foreground text-sm mb-6">{filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""} found</p>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary rounded-xl aspect-[2/3]" />
                <div className="mt-2 h-4 bg-secondary rounded w-3/4" />
                <div className="mt-1 h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (

          <div className="space-y-6 text-center py-20">
            <div>
              <p className="text-4xl mb-4">🎬</p>
              <p className="text-foreground font-semibold text-lg">No movies found</p>
              <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>
            </div>
            {/* show all local asset images as placeholder cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
{posterList.map((url, i) => (
                <MovieCard
                  key={i}
                  movie={{ id: `${i}`, title: `Sample ${i + 1}`, genre: "Action", language: "English", rating: 8.5, assets: url }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
{filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => navigate(`/movie/${movie.id}`)}
              />
            ))}
          </div>
        )}

      </div>
        {/* Trailers Section */}
        <TrailersSection />

      <Footer />
    </div>
  );
};

export default MoviesPage;

