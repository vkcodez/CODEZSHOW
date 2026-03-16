import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Ticket, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Seat = { id: string; row_label: string; seat_number: number; seat_type: string; is_booked: boolean };

const SEAT_PRICES: Record<string, number> = { vip: 1.5, premium: 1.25, standard: 1 };

const BookingPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showtime, setShowtime] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<"seats" | "confirm" | "success">("seats");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchData();
  }, [showtimeId, user]);

  const fetchData = async () => {
    const [{ data: st }, { data: seatData }] = await Promise.all([
      supabase.from("showtimes").select("*, movies(*), theaters(*)").eq("id", showtimeId).single(),
      supabase.from("seats").select("*").eq("showtime_id", showtimeId).order("row_label").order("seat_number"),
    ]);
    setShowtime(st);
    setSeats(seatData || []);
    setLoading(false);
  };

  const rows = [...new Set(seats.map((s) => s.row_label))];

  const toggleSeat = (seat: Seat) => {
    if (seat.is_booked) return;
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : prev.length < 8 ? [...prev, seat.id] : prev
    );
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.is_booked) return "bg-muted text-muted-foreground cursor-not-allowed opacity-50";
    if (selected.includes(seat.id)) return "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30";
    if (seat.seat_type === "vip") return "bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20";
    if (seat.seat_type === "premium") return "bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20";
    return "bg-secondary border-border text-foreground hover:border-primary hover:text-primary";
  };

  const totalAmount = selected.reduce((sum, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return sum + (showtime?.price || 0) * (SEAT_PRICES[seat?.seat_type || "standard"] || 1);
  }, 0);

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      // Mark seats as booked
      await supabase.from("seats").update({ is_booked: true }).in("id", selected);

      // Create booking
      const { data, error } = await supabase.from("bookings").insert({
        user_id: user!.id,
        showtime_id: showtimeId,
        seat_ids: selected,
        total_amount: totalAmount,
        status: "confirmed",
      }).select().single();

      if (error) throw error;

      // Update available seats count
      await supabase.from("showtimes").update({ available_seats: (showtime.available_seats || 0) - selected.length }).eq("id", showtimeId);

      setBooking(data);
      setStep("success");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Booking failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (step === "success") return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <div>
          <h1 className="font-display text-3xl text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground mt-2">Your tickets are booked successfully</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Booking Ref</span>
            <span className="text-primary font-bold">{booking?.booking_reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Movie</span>
            <span className="text-foreground font-medium">{showtime?.movies?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Theater</span>
            <span className="text-foreground text-sm">{showtime?.theaters?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Date & Time</span>
            <span className="text-foreground text-sm">{showtime?.show_date} • {showtime?.show_time?.slice(0, 5)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Seats</span>
            <span className="text-foreground text-sm">{selected.length} seat{selected.length > 1 ? "s" : ""}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="text-foreground font-semibold">Total Paid</span>
            <span className="text-primary font-bold text-lg">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/dashboard")}>My Bookings</Button>
          <Button className="flex-1 rounded-xl" onClick={() => navigate("/movies")}>More Movies</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Back */}
        <button onClick={() => step === "confirm" ? setStep("seats") : navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-6 mb-6 transition-colors">
          <ChevronLeft size={18} /> {step === "confirm" ? "Back to seats" : "Back"}
        </button>

        {/* Show info */}
        {showtime && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex items-center gap-4">
            {showtime.movies?.assets && (
              <img src={showtime.movies.assets} alt="" className="w-12 h-16 object-cover rounded-lg" />
            )}
            <div className="flex-1">
              <h2 className="text-foreground font-bold text-lg">{showtime.movies?.title}</h2>
              <p className="text-muted-foreground text-sm">{showtime.theaters?.name}</p>
              <p className="text-muted-foreground text-sm">{showtime.show_date} • {showtime.show_time?.slice(0, 5)}</p>
            </div>
          </div>
        )}

        {step === "seats" && (
          <>
            <h1 className="font-display text-2xl text-foreground mb-2">Select Seats</h1>
            <p className="text-muted-foreground text-sm mb-6">Select up to 8 seats • {selected.length} selected</p>

            {/* Screen */}
            <div className="mb-8 text-center">
              <div className="h-2 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full mx-auto max-w-2xl" />
              <p className="text-muted-foreground text-xs mt-2 tracking-widest uppercase">Screen</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center mb-8 text-xs text-muted-foreground">
              {[
                { color: "bg-secondary border-border", label: "Available" },
                { color: "bg-primary border-primary", label: "Selected" },
                { color: "bg-muted opacity-50", label: "Booked" },
                { color: "bg-yellow-500/10 border-yellow-500/50", label: `VIP (×1.5)` },
                { color: "bg-blue-500/10 border-blue-500/50", label: `Premium (×1.25)` },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border ${color}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Seat grid */}
            <div className="space-y-2 overflow-x-auto pb-2">
              {rows.map((row) => (
                <div key={row} className="flex items-center gap-2 justify-center">
                  <span className="text-muted-foreground text-sm w-5 text-center flex-shrink-0">{row}</span>
                  <div className="flex gap-1.5 flex-wrap justify-center">
                    {seats.filter((s) => s.row_label === row).map((seat) => (
                      <button key={seat.id} onClick={() => toggleSeat(seat)}
                        className={`w-7 h-7 rounded border text-xs font-medium transition-all flex items-center justify-center ${getSeatColor(seat)}`}>
                        {seat.seat_number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom summary */}
            {selected.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">{selected.length} seat{selected.length > 1 ? "s" : ""} selected</p>
                    <p className="text-foreground font-bold text-xl">₹{totalAmount.toFixed(0)}</p>
                  </div>
                  <Button className="rounded-xl gap-2 px-8" onClick={() => setStep("confirm")}>
                    <Ticket size={16} /> Proceed
                  </Button>
                </div>
              </div>
            )}
            <div className="h-24" />
          </>
        )}

        {step === "confirm" && (
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="font-display text-2xl text-foreground">Confirm Booking</h1>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Movie</span>
                <span className="text-foreground font-medium">{showtime?.movies?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Theater</span>
                <span className="text-foreground">{showtime?.theaters?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="text-foreground">{showtime?.show_date} • {showtime?.show_time?.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Seats</span>
                <span className="text-foreground">
                  {selected.map(id => { const s = seats.find(x => x.id === id); return s ? `${s.row_label}${s.seat_number}` : ""; }).join(", ")}
                </span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="text-foreground font-semibold">Total Amount</span>
                <span className="text-primary font-bold text-xl">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
              🎟️ This is a mock booking. No real payment will be charged.
            </div>
            <Button className="w-full rounded-xl py-3 text-base" onClick={handleConfirmBooking} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm & Book"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
