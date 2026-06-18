/**
 * @file AttractionCard.tsx
 * @description Tarjeta de presentación atómica de una atracción.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje de la tarjeta individual.
 * - Accesibilidad (A11y) optimizada.
 * - Consume el SSoT de 'whatsapp' para el CTA.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { HOTEL_CONFIG } from '@/const';
import { type MappedAttraction } from './types';

interface AttractionCardProps {
  attraction: MappedAttraction;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje de la tarjeta individual
  usePerformanceProfiler('AttractionCard');

  const { t: tWa } = useTranslation('whatsapp');

  const getWhatsAppLink = () => {
    // Consume la plantilla centralizada de WhatsApp
    const message = tWa('attraction_directions', { 
      name: attraction.name,
      defaultValue: `Hola! Me gustaría saber cómo llegar a ${attraction.name} desde el Hotel.`
    });
    return `${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(message)}`;
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center bg-card rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-border flex flex-col transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-muted">
        <img
          src={attraction.image}
          alt={`Fotografía de ${attraction.name}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>

      <div className="p-8 flex flex-col flex-1">
        <h3 className="font-display text-2xl text-foreground mb-3">{attraction.name}</h3>
        <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed flex-1">
          {attraction.description}
        </p>

        <div className="space-y-3 mb-8 border-t border-border pt-6">
          <div className="flex items-center gap-3 text-foreground">
            <MapPin className="w-4 h-4 text-accent shrink-0" />
            <span className="font-body text-sm font-medium">{attraction.distance}</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <span className="font-body text-sm font-medium">{attraction.time}</span>
          </div>
        </div>

        <motion.a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar ruta hacia ${attraction.name} por WhatsApp`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="block w-full text-center py-3.5 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-body text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-accent/50 border-none cursor-pointer"
        >
          Consultar trayecto
        </motion.a>
      </div>
    </motion.div>
  );
};