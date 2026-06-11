import { motion, Variants } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white selection:bg-blue-500 selection:text-white">
      <div className="container py-16 px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        >
          {/* Bloque de Identidad: Uso de Logo PNG rectificado */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <div className="flex items-center">
              <Logo 
                variant="logo-main" 
                theme="light" 
                className="h-14 md:h-16 origin-left scale-110" 
              />
            </div>
            <p className="font-body text-gray-400 text-sm leading-relaxed max-w-xs">
              Siente la calidez de un espacio diseñado para tu bienestar. Tu refugio de hospitalidad auténtica en la principal Avenida das Nações.
            </p>
          </motion.div>

          {/* Bloque de Contacto Directo */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">
              Contacto
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group cursor-default">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-body text-sm text-gray-400 leading-tight">
                  {HOTEL_CONFIG.address}
                </span>
              </div>
              <div className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a 
                  href={HOTEL_CONFIG.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  {HOTEL_CONFIG.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a 
                  href={`mailto:${HOTEL_CONFIG.email}`} 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors break-all underline-offset-4 hover:underline"
                >
                  {HOTEL_CONFIG.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Navegación Estratégica */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">
              Explorar
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Inicio', href: '#home' },
                { name: 'Habitaciones', href: '#rooms' },
                { name: 'Galería', href: '#gallery' },
                { name: 'Atracciones', href: '#attractions' }
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className="font-body text-sm text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Presencia Digital */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">
              Síguenos
            </h4>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Facebook, url: HOTEL_CONFIG.facebookUrl, label: 'Facebook' },
                { icon: Instagram, url: HOTEL_CONFIG.instagramUrl, label: 'Instagram' },
                { icon: Twitter, url: HOTEL_CONFIG.twitterUrl, label: 'X (Twitter)' },
                { icon: Linkedin, url: HOTEL_CONFIG.linkedinUrl, label: 'LinkedIn' }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -3, backgroundColor: 'var(--color-blue-700)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg"
                >
                  <social.icon className="w-5 h-5 text-gray-100" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Divisor de diseño minimalista */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-10" />

        {/* Créditos y Autoría */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4"
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p className="font-body text-xs text-gray-500 uppercase tracking-[0.2em]">
              © 2026 {HOTEL_CONFIG.fullName}
            </p>
          </div>
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <span className="font-body text-[10px] text-gray-600 uppercase tracking-[0.3em] font-medium text-center">
              Estrategia & Código
            </span>
            <div className="hidden md:block h-4 w-px bg-gray-800" />
            <span className="font-display text-xs text-gray-400 group-hover:text-blue-400 transition-all duration-500 tracking-wide text-center">
              Raz Podestá - MetaShark Tech
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}