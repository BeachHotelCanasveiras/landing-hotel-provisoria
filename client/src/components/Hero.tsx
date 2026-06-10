import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';

// Configuración de URLs de Cloudinary con auto-optimización
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/hotel/";

const backgroundImages = [
  `${CLOUDINARY_BASE}hero-1.webp`,
  `${CLOUDINARY_BASE}hero-2.webp`,
  `${CLOUDINARY_BASE}piscina.webp`,
  `${CLOUDINARY_BASE}atardecer.webp`,
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ciclo de transición del carrusel cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number] 
      },
    },
  };

  return (
    <section
      id="home"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Carrusel de Fondo con Cloudinary y Ken Burns Effect */}
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
              backgroundImage: `linear-gradient(rgba(15, 59, 102, 0.5), rgba(15, 59, 102, 0.5)), url(${backgroundImages[currentImageIndex]})`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* Contenido Central */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container text-center text-white px-4 sm:px-6 max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
          <Logo className="h-16 sm:h-20 text-white" withIcon={true} />
        </motion.div>
        
        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
        >
          Tu Refugio en Canasvieiras
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-body text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-gray-100 leading-relaxed"
        >
          Hospitalidad auténtica sobre la Avenida das Nações, a solo dos cuadras del mar. Un rincón diseñado para tu descanso absoluto.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href={HOTEL_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto px-10 py-4 bg-blue-700 text-white rounded-xl font-body text-base font-semibold hover:bg-blue-800 transition-colors shadow-lg"
          >
            Consultar Disponibilidad
          </motion.a>
          <motion.a
            href="#rooms"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-body text-base font-semibold hover:bg-white/20 transition-colors border border-white/20"
          >
            Ver Habitaciones
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Indicador de Scroll Animado */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <ChevronDown className="w-8 h-8 text-white/70" />
      </motion.div>
    </section>
  );
}