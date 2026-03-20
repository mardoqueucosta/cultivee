import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PillarsSection from "@/components/PillarsSection";
import WhySection from "@/components/WhySection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <PillarsSection />
        <WhySection />
        <NewsletterSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;