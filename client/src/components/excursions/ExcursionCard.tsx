/**
 * @file ExcursionCard.tsx
 * @description Tarjeta de presentación atómica de una excursión para el carrusel.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ExcursionItem } from './types';

interface ExcursionCardProps {
  excursion: ExcursionItem;
  name: string;
  description: string;
  duration: string;
  onClick: (excursion: ExcursionItem) => void;
}

export const ExcursionCard: React.FC<ExcursionCardProps> = ({ 
  excursion, name, description, duration, onClick 
}) => {
  return (
    <motion.div
      onClick={() => onClick(excursion)}
      whileHover={{ y: -5 }}
      className="group cursor-pointer select-none bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-full"
    >
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={excursion.image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-900 px-3.5 py-1.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider shadow-xs">
            <Clock size={11} className="text-accent" />
            {duration}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-display text-2xl text-gray-900 mb-3 tracking-tight">{name}</h3>
          <p className="font-body text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
            {description}
          </p>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick(excursion);
          }}
          className="w-full h-12 bg-gray-50 hover:bg-accent hover:text-accent-foreground text-gray-700 border border-gray-100 rounded-full font-body text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Ver detalles
        </Button>
      </div>
    </motion.div>
  );
};