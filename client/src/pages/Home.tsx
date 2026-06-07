import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Rooms from "@/components/Rooms";
import Gallery from "@/components/Gallery";
import Attractions from "@/components/Attractions";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <Rooms />
        <Gallery />
        <Attractions />
        <Testimonials />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
