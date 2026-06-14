/**
 * @file Footer.tsx
 * @description Pie de página institucional y cierre del embudo (Fase de Contacto).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Se integra el nuevo enlace activo de "Excursiones" en la navegación estratégica.
 * - Textos específicos traducidos mediante el namespace 'footer'.
 * - Reutilización asíncrona del namespace 'nav' para las rutas de navegación.
 * - Validación estructural estricta con Zod (FooterTranslationSchema).
 * - Cero regresiones visuales.
 */

import { motion, Variants } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOTEL_CONFIG } from '@/const';
import { Logo } from '@/components/Logo';
import { FooterTranslationSchema } from '@/locales/schemas/footer.schema';

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Footer() {
  const { t: tNav } = useTranslation('nav'); // Reutilizamos el namespace de navegación
  const { t: tFooter, i18n } = useTranslation('footer');

  // ============================================================================
  // CONTRATO DE INTERFAZ (ZOD)
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'footer') || {};
      FooterTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Footer Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  /**
   * Enlaces de navegación combinados de forma segura a partir del namespace 'nav'
   */
  const exploreLinks = [
    { name: tNav('home'), href: '#home' },
    { name: tNav('rooms'), href: '#rooms' },
    { name: tNav('gallery'), href: '#gallery' },
    { name: tNav('attractions'), href: '#attractions' },
    { name: tNav('excursions'), href: '#excursions' }
  ];

  return (
    <footer id="contact" className="bg-[#1A1D20] text-white selection:bg-accent/30 selection:text-white">
      <div className="container py-16 px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        >
          {/* Bloque de Identidad - Proporción Boutique Integrada */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <div className="flex items-center">
              <Logo 
                variant="logo-main" 
                theme="light" 
                className="h-8 md:h-[34px] origin-left" 
              />
            </div>
            <p className="font-body text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              {tFooter('tagline')}
            </p>
          </motion.div>

          {/* Bloque de Contacto Directo */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">
              {tFooter('contact_title')}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group cursor-default">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-300" />
                <span className="font-body text-sm text-gray-400 leading-tight font-light">
                  {HOTEL_CONFIG.address}
                </span>
              </div>
              <div className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-accent shrink-0 group-hover:scale-105 transition-transform duration-300" />
                <a 
                  href={HOTEL_CONFIG.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline font-light"
                >
                  {HOTEL_CONFIG.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-accent shrink-0 group-hover:scale-105 transition-transform duration-300" />
                <a 
                  href={`mailto:${HOTEL_CONFIG.email}`} 
                  className="font-body text-sm text-gray-400 hover:text-white transition-colors break-all underline-offset-4 hover:underline font-light"
                >
                  {HOTEL_CONFIG.email}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Navegación Estratégica */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">
              {tFooter('explore_title')}
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className="font-body text-sm text-gray-400 hover:text-accent transition-all duration-300 flex items-center gap-2 group font-light"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Presencia Digital (Redes Sociales) */}
          <motion.div variants={itemVariants}>
            <h4 className="font-display text-lg mb-6 border-b border-gray-800 pb-2 w-fit">
              {tFooter('social_title')}
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
                  whileHover={{ scale: 1.05, y: -2, backgroundColor: 'var(--color-primary)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                >
                  <social.icon className="w-5 h-5 text-gray-100" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Divisor de diseño minimalista */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800/40 to-transparent my-10" />

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
              {tFooter('strategy_credits_label')}
            </span>
            <div className="hidden md:block h-4 w-px bg-gray-800" />
            <span className="font-display text-xs text-gray-400 group-hover:text-accent transition-all duration-500 tracking-wide text-center">
              Raz Podestá - MetaShark Tech
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}