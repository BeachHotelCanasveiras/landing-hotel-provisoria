import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';

const backgroundImages = [
  '/images/hotel/entrada-principal-hotel-beach-canasvieiras.png',
  '/images/suites/habitacion-single-ejecutiva-cama-matrimonial.png',
  '/images/suites/habitacion-triple-standard-camas-individuales.png',
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ciclo de transición del carrusel cada 3 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Casteo explícito a tupla Bézier para corregir TS2322
      },
    },
  };

  const whatsappMessage = `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}`;

  return (
    <section
      id="home"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20"
    >
      {/* Carrusel de Fondo Dinámico con Fundido y Micromovimientos */}
      <div className="absolute inset-0 z-0 bg-gray-950">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(15, 59, 102, 0.5) 0%, rgba(44, 62, 80, 0.4) 100%), url(${backgroundImages[currentImageIndex]})`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container text-center text-white max-w-3xl mx-auto px-4 sm:px-6"
      >
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs sm:text-sm font-body font-medium border border-white/20 tracking-wider uppercase">
            En la avenida principal de Canasvieiras
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight"
        >
          {HOTEL_CONFIG.fullName}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-body text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed"
        >
          Siente la cercanía del mar y la calidez de un espacio diseñado para el descanso. Ubicados sobre la principal Avenida das Nações, a solo dos cuadras de la playa, te ofrecemos el punto de encuentro perfecto para tus días de desconexión.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none"
        >
          <motion.a
            href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: '0 15px 30px rgba(0,0,0,0.25)' }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-700 text-white rounded-lg font-body text-sm sm:text-base font-semibold hover:bg-blue-800 transition-colors shadow-lg text-center"
          >
            Consultar Disponibilidad
          </motion.a>
          <motion.a
            href="#rooms"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/15 backdrop-blur-md text-white rounded-lg font-body text-sm sm:text-base font-semibold hover:bg-white/25 transition-colors border border-white/25 text-center"
          >
            Ver Habitaciones
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block pointer-events-none"
      >
        <ChevronDown className="w-6 h-6 text-white/60" />
      </motion.div>
    </section>
  );
}