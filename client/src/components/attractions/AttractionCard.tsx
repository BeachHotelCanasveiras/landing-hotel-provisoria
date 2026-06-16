/**
 * @file AttractionCard.tsx
 * @description Tarjeta de presentación atómica de una atracción.
 * - Accesibilidad (A11y) optimizada.
 * - Consume el SSoT de 'whatsapp' para el CTA.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOTEL_CONFIG } from '@/const';
import { type MappedAttraction } from './types';

interface AttractionCardProps {
  attraction: MappedAttraction;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
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
      className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={attraction.image}
          alt={`Fotografía de ${attraction.name}`}
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
            <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="font-body text-sm font-medium">{attraction.distance}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-4 h-4 text-blue-700 shrink-0" />
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
          className="block w-full text-center py-3.5 bg-blue-700 text-white rounded-xl font-body text-sm font-semibold hover:bg-blue-800 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Consultar trayecto
        </motion.a>
      </div>
    </motion.div>
  );
};