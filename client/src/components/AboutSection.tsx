/**
 * @file AboutSection.tsx
 * @description Componente de propuesta de valor (Fase 2 del Embudo: Conexión).
 * Diseñado bajo estética de Lujo Silencioso y Confort.
 * Utiliza validación Zod y desacoplamiento de i18n total.
 */

import { motion, Variants } from 'framer-motion';
import { MapPin, Coffee, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AboutTranslationSchema } from '@/locales/schemas/about.schema';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function AboutSection() {
  const { t, i18n } = useTranslation('about');

  // Validación de contrato Zod en DEV
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'about') || {};
      AboutTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[AboutSection] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Configuración de los 3 pilares de conversión (CRO)
  const features = [
    {
      key: 'location',
      icon: MapPin,
    },
    {
      key: 'breakfast',
      icon: Coffee,
    },
    {
      key: 'warmth',
      icon: HeartHandshake,
    },
  ];

  return (
    <section id="about" className="py-24 bg-white border-b border-gray-100/50">
      <div className="container px-4 sm:px-6">
        
        {/* Cabecera del Bloque */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-gray-200/50">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-5 tracking-tight">
            {t('title')}
          </h2>
          <p className="font-body text-gray-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid de Pilares con micro-interacciones suaves */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.key}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center text-center p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 transition-all duration-300 hover:border-accent hover:bg-white hover:shadow-[0_20px_50px_rgba(212,165,116,0.05)]"
              >
                {/* Círculo contenedor del Icono */}
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <IconComponent className="w-7 h-7" strokeWidth={1.5} />
                </div>
                
                <h3 className="font-display text-xl text-gray-900 mb-3 tracking-tight">
                  {t(`features.${item.key}.title`)}
                </h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed font-light">
                  {t(`features.${item.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}