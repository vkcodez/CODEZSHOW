import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import NowShowing from "@/components/NowShowing";
import TrailersSection from "@/components/TrailersSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <NowShowing />
      <TrailersSection />
      <Footer />
    </div>
  );
};

export default Index;
