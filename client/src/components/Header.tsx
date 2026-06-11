/**
 * @file Header.tsx
 * @description Componente de navegación principal estilo "Píldora Flotante" (Floating Pill).
 * Implementa un Grid trilateral simétrico para un centrado perfecto: Logo a la izquierda (proporción reducida),
 * menú unificado estrictamente en el centro con efectos de hover fluidos ( soft scrolling micro-motion),
 * y botón de acción a la derecha. Todo perfectamente alineado de forma vertical mediante flexbox nativo.
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Rutas de navegación de la SPA.
   */
  const navItems = [
    { label: 'Inicio', href: '#home' },
    { label: 'Habitaciones', href: '#rooms' },
    { label: 'Galería', href: '#gallery' },
    { label: 'Atracciones', href: '#attractions' },
    { label: 'Contacto', href: '#contact' },
  ];

  /**
   * Bloquea el scroll del body cuando el menú móvil está abierto
   * para evitar interacciones no deseadas en el fondo.
   */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  /**
   * Variantes de Framer Motion para el contenedor del menú móvil (Tema Oscuro).
   */
  const menuVariants: Variants = {
    closed: { 
      opacity: 0, 
      y: -10,
      scale: 0.98,
      pointerEvents: 'none',
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
    },
    open: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      pointerEvents: 'auto',
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    },
  };

  /**
   * Variantes de Framer Motion para los items individuales del menú móvil.
   */
  const itemVariants: Variants = {
    closed: { opacity: 0, y: -10 },
    open: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.05, duration: 0.4 } 
    }),
  };

  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* 
        Contenedor Píldora: 
        Estructura de Grid simétrico de 3 columnas para un balance perfecto.
        Paddings asimétricos (pl-5 pr-6) para acercar elegantemente el logo al borde.
        py-3 para mayor esbeltez y look boutique.
      */}
      <nav className="relative pointer-events-auto w-full max-w-4xl bg-black/85 backdrop-blur-lg border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-full pl-5 pr-6 py-3 grid grid-cols-3 items-center transition-all duration-500">
        
        {/* Columna 1: Logotipo Blanco (Alineado a la Izquierda, tamaño refinado) */}
        <div className="flex justify-start items-center">
          <motion.a
            href="#home"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center shrink-0"
          >
            <Logo 
              variant="logo-main" 
              theme="light" 
              className="h-6.5 md:h-[30px] origin-left" 
            />
          </motion.a>
        </div>

        {/* Columna 2: Menú de Navegación Unificado (Estricto centro de pantalla) */}
        <div className="hidden lg:flex justify-center items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white font-display text-[14px] font-medium tracking-wide transition-all duration-300 ease-in-out hover:-translate-y-[1.5px] transform relative group"
            >
              {item.label}
              {/* Línea decorativa color arena que se expande */}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-400 ease-out" />
            </a>
          ))}
        </div>

        {/* Columna 3: CTA / Reservas (Alineado a la Derecha) */}
        <div className="hidden lg:flex justify-end items-center">
          <a
            href="#rooms"
            className="px-6 py-2 bg-white text-gray-950 hover:bg-gray-100 rounded-full font-body text-xs font-semibold transition-all duration-300 ease-in-out shadow-sm hover:scale-[1.02] transform"
          >
            Reservar
          </a>
        </div>

        {/* Mobile Trigger (Colapsa perfectamente en la Columna 3) */}
        <div className="lg:hidden col-start-3 flex justify-end items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white rounded-full hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Alternar menú"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú Móvil: Píldora Desplegable Flotante (Tema Oscuro) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute top-[calc(100%+16px)] left-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto"
            >
              <div className="py-6 px-6 flex flex-col gap-4">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    custom={i}
                    variants={itemVariants}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-300 hover:text-white font-display text-2xl font-medium py-3 border-b border-white/10 transition-colors text-center"
                  >
                    {item.label}
                  </motion.a>
                ))}
                <motion.a
                  variants={itemVariants}
                  custom={navItems.length}
                  href="#rooms"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 px-4 py-4 bg-white text-gray-950 rounded-2xl font-body font-medium text-center text-base shadow-sm"
                >
                  Reservar
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </header>
  );
}