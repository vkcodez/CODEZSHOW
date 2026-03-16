import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Ticket, Users, BarChart3, Plus, Trash2, Edit, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "movies" | "bookings" | "users">("overview");
  const [movies, setMovies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [movieForm, setMovieForm] = useState({
    title: "", description: "", genre: "", language: "Hindi", duration: "120", rating: "7.0",
    poster_url: "", trailer_url: "", release_date: "", is_now_showing: false, is_coming_soon: false
  });

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (!authLoading && user && !isAdmin) { navigate("/"); return; }
    if (user && isAdmin) fetchData();
  }, [user, isAdmin, authLoading]);

  const fetchData = async () => {
    const [{ data: m }, { data: b }, { data: u }] = await Promise.all([
      supabase.from("movies").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, showtimes(show_date, show_time, movies(title), theaters(name)), profiles(full_name)").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false }),
    ]);
    setMovies(m || []);
    setBookings(b || []);
    setUsers(u || []);
    setLoading(false);
  };

  const handleSaveMovie = async () => {
    const payload = {
      title: movieForm.title, description: movieForm.description,
      genre: movieForm.genre.split(",").map(g => g.trim()).filter(Boolean),
      language: movieForm.language, duration: parseInt(movieForm.duration),
      rating: parseFloat(movieForm.rating), poster_url: movieForm.poster_url,
      trailer_url: movieForm.trailer_url, release_date: movieForm.release_date || null,
      is_now_showing: movieForm.is_now_showing, is_coming_soon: movieForm.is_coming_soon,
    };
    if (editingMovie) {
      await supabase.from("movies").update(payload).eq("id", editingMovie.id);
      toast({ title: "Movie updated!" });
    } else {
      await supabase.from("movies").insert(payload);
      toast({ title: "Movie added!" });
    }
    setShowAddMovie(false); setEditingMovie(null);
    resetForm(); fetchData();
  };

  const handleDeleteMovie = async (id: string) => {
    await supabase.from("movies").delete().eq("id", id);
    setMovies(prev => prev.filter(m => m.id !== id));
    toast({ title: "Movie deleted" });
  };

  const startEdit = (movie: any) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title, description: movie.description || "",
      genre: (movie.genre || []).join(", "), language: movie.language || "Hindi",
      duration: String(movie.duration || 120), rating: String(movie.rating || 7.0),
      poster_url: movie.poster_url || "", trailer_url: movie.trailer_url || "",
      release_date: movie.release_date || "", is_now_showing: movie.is_now_showing,
      is_coming_soon: movie.is_coming_soon,
    });
    setShowAddMovie(true);
  };

  const resetForm = () => setMovieForm({ title: "", description: "", genre: "", language: "Hindi", duration: "120", rating: "7.0", poster_url: "", trailer_url: "", release_date: "", is_now_showing: false, is_coming_soon: false });

  const totalRevenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + Number(b.total_amount), 0);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="py-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your QuickShow platform</p>
          </div>
          <span className="bg-primary/20 text-primary text-xs px-3 py-1.5 rounded-full font-semibold border border-primary/30">ADMIN</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Film, label: "Total Movies", value: movies.length, color: "text-blue-400" },
            { icon: Ticket, label: "Total Bookings", value: bookings.length, color: "text-green-400" },
            { icon: Users, label: "Registered Users", value: users.length, color: "text-yellow-400" },
            { icon: BarChart3, label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5">
              <Icon className={`${color} mb-2`} size={22} />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["overview", "movies", "bookings", "users"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize flex-shrink-0 ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{tab}</button>
          ))}
        </div>

        {/* Movies Tab */}
        {activeTab === "movies" && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-foreground font-semibold text-lg">Manage Movies ({movies.length})</h2>
              <Button className="rounded-xl gap-2" onClick={() => { resetForm(); setEditingMovie(null); setShowAddMovie(true); }}>
                <Plus size={16} /> Add Movie
              </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddMovie && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <div className="flex justify-between mb-5">
                  <h3 className="text-foreground font-semibold">{editingMovie ? "Edit Movie" : "Add New Movie"}</h3>
                  <button onClick={() => { setShowAddMovie(false); setEditingMovie(null); }}><X size={18} className="text-muted-foreground hover:text-foreground" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Title *</label><Input value={movieForm.title} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} className="bg-secondary" /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Language</label><Input value={movieForm.language} onChange={e => setMovieForm({ ...movieForm, language: e.target.value })} className="bg-secondary" /></div>
                  <div className="space-y-1.5 md:col-span-2"><label className="text-sm text-muted-foreground">Description</label><textarea value={movieForm.description} onChange={e => setMovieForm({ ...movieForm, description: e.target.value })} rows={3} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary resize-none" /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Genre (comma-separated)</label><Input value={movieForm.genre} onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })} placeholder="Action, Drama" className="bg-secondary" /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Duration (minutes)</label><Input type="number" value={movieForm.duration} onChange={e => setMovieForm({ ...movieForm, duration: e.target.value })} className="bg-secondary" /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Rating (0-10)</label><Input type="number" step="0.1" value={movieForm.rating} onChange={e => setMovieForm({ ...movieForm, rating: e.target.value })} className="bg-secondary" /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Release Date</label><Input type="date" value={movieForm.release_date} onChange={e => setMovieForm({ ...movieForm, release_date: e.target.value })} className="bg-secondary" /></div>
                  <div className="space-y-1.5 md:col-span-2"><label className="text-sm text-muted-foreground">Poster URL</label><Input value={movieForm.poster_url} onChange={e => setMovieForm({ ...movieForm, poster_url: e.target.value })} className="bg-secondary" /></div>
                  <div className="space-y-1.5 md:col-span-2"><label className="text-sm text-muted-foreground">Trailer URL (YouTube embed)</label><Input value={movieForm.trailer_url} onChange={e => setMovieForm({ ...movieForm, trailer_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." className="bg-secondary" /></div>
                  <div className="flex gap-6 md:col-span-2">
                    {[{ key: "is_now_showing" as const, label: "Now Showing" }, { key: "is_coming_soon" as const, label: "Coming Soon" }].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <div onClick={() => setMovieForm({ ...movieForm, [key]: !movieForm[key] })}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${movieForm[key] ? "bg-primary border-primary" : "border-border"}`}>
                          {movieForm[key] && <Check size={12} className="text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button className="rounded-xl" onClick={handleSaveMovie} disabled={!movieForm.title}>{editingMovie ? "Update" : "Add Movie"}</Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => { setShowAddMovie(false); setEditingMovie(null); }}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {movies.map((movie) => (
                <div key={movie.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  {movie.assets && <img src={movie.assets} alt="" className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-medium truncate">{movie.title}</h3>
                    <p className="text-muted-foreground text-xs">{(movie.genre || []).join(", ")} • {movie.language} • ⭐ {movie.rating}</p>
                    <div className="flex gap-2 mt-1">
                      {movie.is_now_showing && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Now Showing</span>}
                      {movie.is_coming_soon && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Coming Soon</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(movie)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteMovie(movie.id)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-5">All Bookings ({bookings.length})</h2>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    {["Reference", "Movie", "Theater", "Date/Time", "Amount", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-primary font-mono text-xs">{b.booking_reference}</td>
                      <td className="px-4 py-3 text-foreground">{b.showtimes?.movies?.title || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.showtimes?.theaters?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.showtimes?.show_date} {b.showtimes?.show_time?.slice(0, 5)}</td>
                      <td className="px-4 py-3 text-foreground font-medium">₹{b.total_amount}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${b.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-foreground font-semibold text-lg mb-5">Registered Users ({users.length})</h2>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    {["Name", "Role", "Phone", "Joined"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 text-foreground">{u.full_name || "—"}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${u.user_roles?.[0]?.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>{u.user_roles?.[0]?.role || "user"}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-foreground font-semibold mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-foreground">{b.showtimes?.movies?.title}</p>
                      <p className="text-muted-foreground text-xs">{b.booking_reference}</p>
                    </div>
                    <span className="text-primary font-semibold">₹{b.total_amount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-foreground font-semibold mb-4">Movies at a Glance</h3>
              <div className="space-y-3">
                {movies.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center gap-3 text-sm">
                    {m.assets && <img src={m.assets} alt="" className="w-8 h-10 object-cover rounded" />}
                    <div className="flex-1">
                      <p className="text-foreground truncate">{m.title}</p>
                      <p className="text-muted-foreground text-xs">⭐ {m.rating}</p>
                    </div>
                    {m.is_now_showing && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Live</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
