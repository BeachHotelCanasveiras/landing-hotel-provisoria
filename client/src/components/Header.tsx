import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#home' },
    { label: 'Habitaciones', href: '#rooms' },
    { label: 'Galería', href: '#gallery' },
    { label: 'Atracciones', href: '#attractions' },
    { label: 'Contacto', href: '#contact' },
  ];

  const menuVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <nav className="container flex items-center justify-between h-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-display text-lg">B</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-lg text-blue-700">Beach Hotel</h1>
            <p className="text-xs text-gray-600">Canasvieiras</p>
          </div>
        </motion.div>

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

        {/* CTA Button */}
        <motion.a
          href="https://wa.me/5548999999999?text=Hola%20Beach%20Hotel%20Canasvieiras%2C%20me%20gustaría%20hacer%20una%20reserva"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:block px-6 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Reservar
        </motion.a>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        variants={menuVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
      >
        <div className="container py-4 flex flex-col gap-4">
          {navItems.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              custom={i}
              variants={itemVariants}
              initial="closed"
              animate={isOpen ? 'open' : 'closed'}
              onClick={() => setIsOpen(false)}
              className="text-gray-700 hover:text-blue-700 font-body text-sm font-medium transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
          <motion.a
            href="https://wa.me/5548999999999?text=Hola%20Beach%20Hotel%20Canasvieiras%2C%20me%20gustaría%20hacer%20una%20reserva"
            target="_blank"
            rel="noopener noreferrer"
            initial="closed"
            animate={isOpen ? 'open' : 'closed'}
            custom={navItems.length}
            variants={itemVariants}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg font-body text-sm font-medium hover:bg-blue-800 transition-colors text-center"
          >
            Reservar por WhatsApp
          </motion.a>
        </div>
      </motion.div>
    </header>
  );
}
