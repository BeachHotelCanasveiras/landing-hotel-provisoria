import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HOTEL_CONFIG } from '@/const';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#home' },
    { label: 'Habitaciones', href: '#rooms' },
    { label: 'Galería', href: '#gallery' },
    { label: 'Atracciones', href: '#attractions' },
    { label: 'Contacto', href: '#contact' },
  ];

  // Prevenir scroll en el fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Se añade anotación explícita de tipo para cumplir con Framer Motion 12
  const menuVariants: Variants = {
    closed: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.25, ease: 'easeInOut' }
    },
    open: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
  };

  // Se añade anotación explícita de tipo para evitar colisiones en firmas de índice
  const itemVariants: Variants = {
    closed: { opacity: 0, x: -10 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  const whatsappMessage = `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <nav className="container flex items-center justify-between h-16 sm:h-20 px-4">
        {/* Logo Real con fondo transparente */}
        <motion.a
          href="#home"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <img 
            src="/logo-dark.svg" 
            alt={`Logotipo oficial de ${HOTEL_CONFIG.name}`} 
            className="h-10 sm:h-12 w-auto object-contain"
            loading="eager" // Carga inmediata para LCP óptimo
          />
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-gray-700 hover:text-blue-700 font-body text-sm font-medium transition-colors relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* CTA Button (Desktop) */}
        <motion.a
          href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block px-6 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Reservar
        </motion.a>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-700 focus:outline-none"
          whileTap={{ scale: 0.95 }}
          aria-label="Abrir menú"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-white border-b border-gray-200 overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            <div className="container py-6 px-4 flex flex-col gap-4">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  custom={i}
                  variants={itemVariants}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-blue-700 font-body text-base font-medium py-2 border-b border-gray-100 transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a
                href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                custom={navItems.length}
                variants={itemVariants}
                className="mt-2 px-4 py-3 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors text-center"
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