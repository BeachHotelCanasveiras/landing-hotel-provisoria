/**
 * @file Attractions.tsx
 * @description Orquestador de Atracciones Locales (Fase 5 del Embudo).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del carrusel de atracciones.
 * - Cero 'any' (ESLint v9 Compliant) mediante validación de tipos `unknown`.
 * - Táctica Híbrida de UX: Snap-Scroll en Móvil para evitar fatiga de lectura, Grid en Desktop.
 */

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { AttractionsTranslationSchema } from '@/locales/schemas/attractions.schema';
import { AttractionCard } from './AttractionCard';
import { type AttractionConfig, type AttractionTranslation, type MappedAttraction } from './types';

// SSoT de configuración visual (Imágenes de Unsplash optimizadas)
const ATTRACTIONS_CONFIG: AttractionConfig[] = [
  { id: 1, key: 'brava', image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
  { id: 2, key: 'jurere', image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" },
  { id: 3, key: 'aguashow', image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80" },
  { id: 4, key: 'centro', image: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80" },
  { id: 5, key: 'frances', image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80" },
  { id: 6, key: 'fortaleza', image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export const Attractions: React.FC = () => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del componente
  usePerformanceProfiler('Attractions');

  const { t, i18n } = useTranslation('attractions');

  // Failsafe de integridad del esquema en DEV
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'attractions') || {};
      AttractionsTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Attractions] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Mapeo Tipado (Cero 'any' explícito)
  const mappedAttractions: MappedAttraction[] = useMemo(() => {
    return ATTRACTIONS_CONFIG.map((config) => {
      const rawData = t(`items.${config.key}`, { returnObjects: true });
      const isObject = typeof rawData === 'object' && rawData !== null;
      
      // Casteo seguro usando 'unknown' como puente
      const typedData = isObject ? (rawData as unknown as AttractionTranslation) : null;

      return {
        ...config,
        name: typedData?.name || '',
        description: typedData?.description || '',
        distance: typedData?.distance || '',
        time: typedData?.time || '',
      };
    });
  }, [t]);

  return (
    <section id="attractions" className="py-20 bg-muted/50 overflow-hidden transition-colors duration-300">
      <div className="container px-4 sm:px-6">
        
        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-body font-medium mb-4 uppercase tracking-wider border border-accent/20">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 tracking-tight">
            {t('title')}
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg font-light">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* ESTRUCTURA HÍBRIDA (Snap-Scroll en Móvil, Grid en Desktop) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-8 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0"
        >
          {mappedAttractions.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </motion.div>

        {/* Indicador táctil móvil */}
        <div className="flex md:hidden justify-center items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Desliza para ver más destinos
          </p>
        </div>

      </div>
    </section>
  );
};