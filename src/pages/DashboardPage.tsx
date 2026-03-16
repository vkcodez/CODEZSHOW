import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ticket, User, Calendar, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const [{ data: bookingData }, { data: profileData }] = await Promise.all([
      supabase.from("bookings").select("*, showtimes(show_date, show_time, price, movies(title, poster_url), theaters(name))").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
    ]);
    setBookings(bookingData || []);
    setProfile(profileData);
    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    toast({ title: "Booking cancelled" });
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("profiles").update({
      full_name: fd.get("full_name") as string,
      phone: fd.get("phone") as string,
    }).eq("user_id", user!.id);
    if (!error) { toast({ title: "Profile updated!" }); fetchData(); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="py-8">
          <h1 className="font-display text-4xl text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Ticket, label: "Total Bookings", value: bookings.length },
            { icon: Film, label: "Movies Watched", value: new Set(bookings.filter(b => b.status === "confirmed").map(b => b.showtimes?.movies?.title)).size },
            { icon: Calendar, label: "Upcoming", value: bookings.filter(b => b.status === "confirmed" && new Date(b.showtimes?.show_date) >= new Date()).length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5">
              <Icon className="text-primary mb-2" size={20} />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["bookings", "profile"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Ticket className="mx-auto text-muted-foreground mb-3" size={40} />
                <p className="text-foreground font-semibold">No bookings yet</p>
                <p className="text-muted-foreground text-sm mt-1">Start by booking a movie ticket</p>
                <Button className="mt-4 rounded-xl" onClick={() => navigate("/movies")}>Browse Movies</Button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-card border border-border rounded-2xl p-5 flex gap-4">
                  {booking.showtimes?.movies?.assets && (
                    <img src={booking.showtimes.movies.assets} alt="" className="w-16 h-24 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-foreground font-semibold">{booking.showtimes?.movies?.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        booking.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>{booking.status}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{booking.showtimes?.theaters?.name}</p>
                    <p className="text-muted-foreground text-sm">{booking.showtimes?.show_date} • {booking.showtimes?.show_time?.slice(0, 5)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-primary font-bold">₹{booking.total_amount}</span>
                        <span className="text-muted-foreground text-xs ml-2">Ref: {booking.booking_reference}</span>
                      </div>
                      {booking.status === "confirmed" && new Date(booking.showtimes?.show_date) >= new Date() && (
                        <button onClick={() => cancelBooking(booking.id)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors">
                          <X size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-md">
            <form onSubmit={updateProfile} className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><User size={18} /> Profile Details</h3>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input name="full_name" defaultValue={profile?.full_name || ""}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input value={user?.email || ""} readOnly
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-muted-foreground text-sm cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input name="phone" defaultValue={profile?.phone || ""}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors" />
              </div>
              <Button type="submit" className="w-full rounded-xl">Save Changes</Button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
