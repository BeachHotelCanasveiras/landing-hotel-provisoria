/**
 * @file Hero.tsx
 * @description Componente principal de cabecera (Hero Section).
 * Refactorizado bajo la filosofía "Confort y Calidez Costera".
 * Se ha eliminado el texto pretencioso para priorizar un mensaje directo y acogedor.
 * La animación de flotación vertical se sustituyó por un efecto "ola" (deriva horizontal lenta),
 * y los CTAs se han optimizado estratégicamente para guiar al usuario hacia las habitaciones y la galería.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * CONFIGURACIÓN DE ACTIVOS - CLOUDINARY
 * f_auto,q_auto: Optimización de formato y peso dinámica desde CDN.
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

  /**
   * Intervalo del carrusel de fondo cinemático.
   * Transiciones lentas para evocar tranquilidad y confort.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  /**
   * Variantes para la entrada escalonada del contenido de texto.
   */
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

  /**
   * Efecto Marea / Ola (Wave Effect).
   * Un movimiento horizontal ultra-lento que emula la brisa marina o el vaivén del agua.
   * Reemplaza el antiguo y mecánico rebote vertical.
   */
  const waveVariants: Variants = {
    animate: {
      x: [-8, 8, -8],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  /**
   * Variantes de entrada individual (fade-up suave y acogedor).
   */
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 1.2, 
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
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              /* Gradiente ajustado para proteger la legibilidad sin oscurecer demasiado la imagen */
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.55)), url(${backgroundImages[currentImageIndex]})`,
            }}
          />
        </AnimatePresence>
      </div>

      {/* Overlay de Gradiente extra para integrar suavemente con la siguiente sección */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />

      {/* Contenido Principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container text-center text-white px-4 sm:px-6 max-w-4xl mx-auto"
      >
        <motion.div
          variants={waveVariants}
          animate="animate"
          className="flex flex-col items-center pt-16 md:pt-0"
        >
          {/* Título Principal: Legible, cálido y proporcionado */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl sm:text-7xl md:text-[5.5rem] font-medium mb-6 leading-[1.15] tracking-tight drop-shadow-xl"
          >
            Tu refugio en <br />
            <span className="italic font-normal text-white">Canasvieiras</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-body text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/95 font-light leading-relaxed drop-shadow-md"
          >
            Hospitalidad auténtica sobre la Avenida das Nações. 
            Un rincón diseñado para tu descanso absoluto a pasos del mar.
          </motion.p>

          {/* Grupo de Botones: Accesibles y amigables (Confort) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
          >
            <motion.a
              href="#rooms"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-9 py-3.5 bg-primary text-primary-foreground rounded-full font-body text-sm font-medium shadow-2xl hover:bg-primary/90 transition-all"
            >
              Consultar Disponibilidad
            </motion.a>
            <motion.a
              href="#gallery"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-9 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-full font-body text-sm font-medium border border-white/20 transition-all"
            >
              Ver Galería
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
        <ChevronDown className="w-8 h-8 text-white/60" strokeWidth={1.5} />
      </motion.div>
    </section>
  );
}