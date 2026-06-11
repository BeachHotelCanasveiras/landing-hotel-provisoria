import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#home' },
    { label: 'Habitaciones', href: '#rooms' },
    { label: 'Galería', href: '#gallery' },
    { label: 'Atracciones', href: '#attractions' },
    { label: 'Contacto', href: '#contact' },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const menuVariants: Variants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.25, ease: 'easeInOut' } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, x: -10 },
    open: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05 } }),
  };

  const whatsappMessage = `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-white/5">
      <nav className="container flex items-center justify-between h-20 md:h-24 px-4 sm:px-6">
        
        {/* Logo Blanco para fondo negro */}
        <motion.a
          href="#home"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center shrink-0"
        >
          <Logo 
            variant="logo-main" 
            theme="light" 
            className="h-10 md:h-14" 
          />
        </motion.a>

        {/* Desktop Navigation en Blanco/Gris */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-gray-300 hover:text-white font-body text-sm font-semibold transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <motion.a
            href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-8 py-3 bg-blue-700 text-white rounded-xl font-body text-sm font-bold hover:bg-blue-600 transition-all shadow-lg"
          >
            Reservar
          </motion.a>

          {/* Menú Trigger para Móvil */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 text-white rounded-xl bg-white/5 border border-white/10 active:scale-95 transition-transform"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Oscuro */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden bg-gray-950 border-b border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="container py-8 px-6 flex flex-col gap-6">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  custom={i}
                  variants={itemVariants}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white font-body text-xl font-bold py-2 border-b border-white/5"
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a
                variants={itemVariants}
                custom={navItems.length}
                href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
                className="mt-2 px-4 py-5 bg-blue-700 text-white rounded-2xl font-bold text-center text-lg"
              >
                Reservar por WhatsApp
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}