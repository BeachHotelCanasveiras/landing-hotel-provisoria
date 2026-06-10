import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';

const backgroundImages = [
  '/images/hotel/entrada-principal-hotel-beach-canasvieiras.webp',
  '/images/hotel/fachada-hotel-beach-canasvieiras-exterior.webp',
  '/images/hotel/piscina-hotel-beach-canasvieiras.webp',
  '/images/hotel/atardecer-hotel-beach-canasvieiras.webp',
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 4000); // Subí a 4s para dar tiempo a apreciar la foto
    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any },
  };

  return (
    <section id="home" className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0 bg-gray-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 59, 102, 0.6), rgba(15, 59, 102, 0.6)), url(${backgroundImages[currentImageIndex]})`,
            }}
          />
        </AnimatePresence>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 container text-center text-white px-4">
        <motion.div variants={itemVariants} className="mb-6 flex justify-center">
          <Logo className="h-16 text-white" withIcon={true} />
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-display text-4xl md:text-7xl font-bold mb-6">
          Tu Refugio en Canasvieiras
        </motion.h1>

        <motion.p variants={itemVariants} className="font-body text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-100">
          Ubicación privilegiada sobre la Avenida das Nações, a dos cuadras del mar. La calidez de un hogar con la atención que mereces.
        </motion.p>
      </motion.div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 z-10">
        <ChevronDown className="w-8 h-8 text-white" />
      </motion.div>
    </section>
  );
}