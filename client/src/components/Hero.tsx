import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';

/**
 * CONFIGURACIÓN DE ACTIVOS - CLOUDINARY
 * f_auto,q_auto: Optimización de formato y peso.
 */
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/hotel/";

const backgroundImages = [
  `${CLOUDINARY_BASE}hero-1.webp`,
  `${CLOUDINARY_BASE}hero-2.webp`,
  `${CLOUDINARY_BASE}piscina.webp`,
  `${CLOUDINARY_BASE}atardecer.webp`,
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Intervalo de 5s para un ritmo más pausado
    return () => clearInterval(timer);
  }, []);

  // Variantes para la entrada del contenedor
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

  // Micromovimiento de flotación lenta (Breathing Effect)
  const floatingVariants: Variants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 1, 
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number] 
      },
    },
  };

  return (
    <section
      id="home"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gray-950"
    >
      {/* Carrusel de Fondo Dinámico */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${backgroundImages[currentImageIndex]})`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* Overlay de Gradiente para profundidad */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-gray-950/80 via-transparent to-black/20" />

      {/* Contenido Principal con Elevación Espacial */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container text-center text-white px-4 sm:px-6 max-w-5xl mx-auto -mt-16 md:-mt-24"
      >
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="flex flex-col items-center"
        >
          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-7xl md:text-8xl font-bold mb-6 leading-[1.1] tracking-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
          >
            Tu Refugio en <br />
            <span className="text-blue-400">Canasvieiras</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-body text-lg sm:text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-gray-100/90 leading-relaxed drop-shadow-md"
          >
            Hospitalidad auténtica sobre la Avenida das Nações. 
            Un rincón diseñado para tu descanso absoluto a pasos del mar.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full sm:w-auto"
          >
            <motion.a
              href={HOTEL_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, backgroundColor: "#1d4ed8" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-body text-base font-bold shadow-2xl transition-all"
            >
              Consultar Disponibilidad
            </motion.a>
            <motion.a
              href="#rooms"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md text-white rounded-2xl font-body text-base font-bold border border-white/20 transition-all"
            >
              Ver Habitaciones
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Indicador de Scroll Minimalista */}
      <motion.div
        animate={{ y: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <ChevronDown className="w-8 h-8 text-white/50" strokeWidth={1.5} />
      </motion.div>
    </section>
  );
}