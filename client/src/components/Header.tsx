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

  const whatsappMessage = `Hola, me gustaría consultar disponibilidad para hacer una reserva en ${HOTEL_CONFIG.name}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100">
      <nav className="container flex items-center justify-between h-20 md:h-24 px-4">
        
        {/* Logo Oficial Rectificado (Color Negro, Proporciones Exactas) */}
        <motion.a
          href="#home"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center shrink-0"
        >
          <Logo className="scale-90 md:scale-100 transform-origin-left" withIcon={true} />
        </motion.a>

        {/* Navegación Desktop: Aumentado el gap para airear el diseño */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-800 hover:text-blue-700 font-body text-sm font-semibold transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-700 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Botón CTA: Azul corporativo para contraste con el logo negro */}
        <div className="flex items-center gap-4">
          <motion.a
            href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-8 py-3 bg-blue-700 text-white rounded-xl font-body text-sm font-bold hover:bg-blue-800 transition-all shadow-md"
          >
            Reservar
          </motion.a>

          {/* Botón de Menú Móvil */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-900"
            aria-label="Abrir menú"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Menú Móvil Refactorizado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="container py-8 px-6 flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-900 text-xl font-bold border-b border-gray-50 pb-2"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(whatsappMessage)}`}
                className="mt-2 px-4 py-4 bg-blue-700 text-white rounded-xl font-bold text-center text-lg"
              >
                Reservar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}