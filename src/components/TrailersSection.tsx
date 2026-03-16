import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const trailers = [
  {
    id: "WpW36ldAqnM",
    title: "Ironheart | Official Trailer | Disney+",
    channel: "Marvel Entertainment",
  },
  {
    id: "-sAOWhvheK8",
    title: "Avengers Secret Wars | First Look Trailer",
    channel: "Marvel Entertainment",
  },
  {
    id: "1pHDWnXmK7Y",
    title: "Fantastic Four | Official Trailer",
    channel: "Marvel Entertainment",
  },
  {
    id: "umiKiW4En9g",
    title: "Captain America: New World Order",
    channel: "Marvel Entertainment",
  },
  {
    id: "aZXBFirj6b4",
    title: "Avengers: Doomsday | Now in Production",
    channel: "Marvel Entertainment",
  },
  {
    id: "TcMBFSGVi1c",
    title: "MS Avengers: Endgame |Official Trailer",
    channel: "Marvel Entertainment",
  },
  {
    id: "73_1biulkYk",
    title: "Deadpool & Wolverine | Official Trailer",
    channel: "Marvel Entertainment",
  },
  {
    id: "18QQWa5MEcs",
    title: "The Fantastic Four: First Steps | Final Trailer ",
    channel: "Marvel Entertainment",
  },
  {
    id: "twHYF506-9Y",
    title: "Marvel Animation’s Zombies | Official Trailer",
    channel: "Marvel Entertainment",
  },
  {
    id: "wS_qbDztgVY",
    title: "The Marvels | Official Trailer",
    channel: "Marvel Entertainment",
  },
];

const TrailerCard = ({ trailer }: { trailer: (typeof trailers)[0] }) => {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://img.youtube.com/vi/${trailer.id}/maxresdefault.jpg`;

  return (
    <div className="flex-shrink-0 w-72 md:w-80 group cursor-pointer" onClick={() => setPlaying(true)}>
      <div className="relative overflow-hidden rounded-xl aspect-video bg-muted">
        {playing ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${trailer.id}?autoplay=1`}
            title={trailer.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={thumb}
              alt={trailer.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:bg-black/40 transition-all flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Play size={24} fill="white" className="text-white ml-1 drop-shadow-lg" />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-3">
        <p className="text-foreground font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{trailer.title}</p>
        <p className="text-muted-foreground text-xs mt-1">{trailer.channel}</p>
      </div>
    </div>
  );
};

const TrailersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">Trailers</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary" />
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory">
            {trailers.map((trailer) => (
              <TrailerCard key={trailer.id} trailer={trailer} />
            ))}
          </div>
          
          {/* Scroll Buttons - Always visible, hover enhanced */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-xl border-2 border-border/50 hover:border-primary/80 p-4 rounded-full shadow-2xl hover:shadow-primary/20 hover:scale-110 transition-all duration-300 z-40 text-primary hover:text-primary-foreground font-bold text-2xl opacity-90 hover:opacity-100 group-hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeft size={28} className="drop-shadow-lg" />
          </button>
          
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-background/95 backdrop-blur-xl border-2 border-border/50 hover:border-primary/80 p-4 rounded-full shadow-2xl hover:shadow-primary/20 hover:scale-110 transition-all duration-300 z-40 text-primary hover:text-primary-foreground font-bold text-2xl opacity-90 hover:opacity-100 group-hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRight size={28} className="drop-shadow-lg" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrailersSection;