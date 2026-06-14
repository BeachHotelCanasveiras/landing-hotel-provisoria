/**
 * @file Attractions.tsx
 * @description Sección de Atracciones Turísticas (Fase 5 del Embudo: Viabilidad Logística).
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Traducciones totalmente desacopladas e integradas al namespace 'attractions'.
 * - Validación defensiva de contratos de traducción con Zod en modo DEV.
 * - Enlaces temporales optimizados desde Unsplash para evitar enlaces rotos durante el desarrollo.
 * - Interpolación dinámica y localizada en tiempo de ejecución para el enlace de WhatsApp (CRO).
 */

import { motion, Variants } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOTEL_CONFIG } from '@/const';
import { AttractionsTranslationSchema } from '@/locales/schemas/attractions.schema';

// Metadata física de las atracciones con enlaces temporales de alta definición de Unsplash
const ATTRACTIONS_CONFIG = [
  {
    id: 1,
    key: 'brava' as const,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // Playa salvaje y olas
  },
  {
    id: 2,
    key: 'jurere' as const,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", // Playa exclusiva y muelle
  },
  {
    id: 3,
    key: 'aguashow' as const,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80", // Complejo de piscina y tobogán
  },
  {
    id: 4,
    key: 'centro' as const,
    image: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80", // Calles de arquitectura colonial
  },
  {
    id: 5,
    key: 'frances' as const,
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80", // Bahía de agua cristalina y verde
  },
  {
    id: 6,
    key: 'fortaleza' as const,
    image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80", // Fortaleza de piedra frente al mar
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

export default function Attractions() {
  const { t, i18n } = useTranslation('attractions');

  // ============================================================================
  // VALIDACIÓN DE INTEGRIDAD DEL ESQUEMA (ZOD)
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'attractions') || {};
      AttractionsTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Attractions Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  /**
   * Unificar configuración física de Unsplash con los textos localizados dinámicamente.
   * Agrega validación defensiva para evitar excepciones si las llaves no han sido compiladas.
   */
  const attractions = ATTRACTIONS_CONFIG.map((config) => {
    const rawData = t(`items.${config.key}`, { returnObjects: true });
    const isObject = typeof rawData === 'object' && rawData !== null;

    return {
      ...config,
      name: isObject ? (rawData as any).name || '' : '',
      description: isObject ? (rawData as any).description || '' : '',
      distance: isObject ? (rawData as any).distance || '' : '',
      time: isObject ? (rawData as any).time || '' : '',
    };
  });

  return (
    <section id="attractions" className="py-20 bg-gray-50">
      <div className="container px-4">
        
        {/* Cabecera de Sección */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-body font-medium mb-4 uppercase tracking-wider">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Grid de Atracciones */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {attractions.map((attraction) => (
            <motion.div
              key={attraction.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="font-display text-2xl text-gray-900 mb-3">{attraction.name}</h3>
                <p className="font-body text-sm text-gray-600 mb-6 leading-relaxed flex-1">
                  {attraction.description}
                </p>

                <div className="space-y-3 mb-8 border-t border-gray-50 pt-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm font-medium">{attraction.distance}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span className="font-body text-sm font-medium">{attraction.time}</span>
                  </div>
                </div>

                {/* Enlace dinámico optimizado con interpolación localizada para el mensaje de WhatsApp */}
                <motion.a
                  href={`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(
                    t('whatsapp_query_template', { name: attraction.name })
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full text-center py-3 bg-blue-700 text-white rounded-xl font-body text-sm font-semibold hover:bg-blue-800 transition-colors shadow-md"
                >
                  {t('cta_button')}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}