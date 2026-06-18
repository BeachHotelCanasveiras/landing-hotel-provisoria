/**
 * @file Excursions.tsx
 * @description Orquestador principal del ecosistema de Excursiones (Módulo B2C/B2B).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-background, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del carrusel de excursiones.
 * - Trinidad Atómica: Localización total del texto de experiencias (Zod + i18next).
 * - UX Premium: Integración de filtros por tags, HMR compatible y auto-scroll asíncrono.
 * - Saneamiento: Se corrige el error TS2304 importando explícitamente el helper "cn".
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { ExcursionsTranslationSchema } from '@/locales/schemas/excursions.schema';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { type ExcursionItem, FALLBACK_EXCURSIONS } from './types';
import { ExcursionCard } from './ExcursionCard';
import { ExcursionDetailModal } from './ExcursionDetailModal';
import { cn } from '@/lib/utils'; // 🚀 Saneamiento TS2304: Importación agregada de forma segura

export const Excursions: React.FC = () => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje de la sección de excursiones
  usePerformanceProfiler('Excursions');

  const { t, i18n } = useTranslation('excursions');
  const [selectedExcursion, setSelectedExcursion] = useState<ExcursionItem | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  // Validación Failsafe de diccionarios en desarrollo
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'excursions') || {};
      ExcursionsTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Excursions] ❌ Error de integridad en diccionario:`, error);
    }
  }

  // Auto-Scroll asíncrono preventivo
  useEffect(() => {
    if (!api || selectedExcursion) return;
    const intervalId = setInterval(() => api.scrollNext(), 2500);
    return () => clearInterval(intervalId);
  }, [api, selectedExcursion]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!api) return;
    
    // Resolución ESLint v9 (no-unused-expressions): Uso semántico de bloques condicionales
    if (direction === 'left') {
      api.scrollPrev();
    } else {
      api.scrollNext();
    }
  };

  // Mock temporal de tags extraídos para el UI Placeholder
  const allTags = Array.from(new Set(FALLBACK_EXCURSIONS.flatMap(e => e.tags || [])));

  return (
    <section id="excursions" className="py-24 bg-background border-b border-border transition-colors duration-300">
      <div className="container px-4 sm:px-6">
        
        {/* Cabecera Central */}
        <div className="text-center mb-10 relative">
          <span className="inline-block px-5 py-1.5 bg-muted text-muted-foreground rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-border">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-5 tracking-tight">
            {t('title')}
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-light mb-8">
            {t('subtitle')}
          </p>

          {/* 🔍 APARATO DE FILTRADO (UI Placeholder para la Fase 4) */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-10">
            <button 
              onClick={() => setActiveTag(null)}
              className={cn(
                "px-4 py-2 rounded-full font-body text-xs font-semibold transition-all border cursor-pointer",
                !activeTag 
                  ? "bg-primary text-primary-foreground border-primary shadow-md" 
                  : "bg-card text-muted-foreground border-border hover:border-accent"
              )}
            >
              Todas
            </button>
            {allTags.map(tag => {
              const IsActiveTag = activeTag === tag;
              return (
                <button 
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer",
                    IsActiveTag 
                      ? "bg-accent text-accent-foreground border-accent shadow-md" 
                      : "bg-card text-muted-foreground border-border hover:border-accent"
                  )}
                >
                  <Tag size={12} /> {tag}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex absolute bottom-0 right-4 gap-2">
            <button 
              aria-label="Anterior" 
              onClick={() => handleScroll('left')} 
              className="p-3 bg-muted hover:bg-muted text-foreground rounded-full border border-border transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              aria-label="Siguiente" 
              onClick={() => handleScroll('right')} 
              className="p-3 bg-muted hover:bg-muted text-foreground rounded-full border border-border transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carrusel Principal */}
        <Carousel setApi={setApi} opts={{ align: "start", loop: true, duration: 40 }} className="w-full">
          <CarouselContent className="-ml-4">
            {FALLBACK_EXCURSIONS.filter(e => !activeTag || e.tags?.includes(activeTag)).map((exc) => (
              <CarouselItem key={exc.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <ExcursionCard 
                  excursion={exc}
                  name={t(`items.${exc.id}.name`)}
                  description={t(`items.${exc.id}.description`)}
                  duration={t(`items.${exc.id}.duration`)}
                  onClick={setSelectedExcursion}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex lg:hidden justify-center items-center gap-1.5 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Desliza para explorar
          </p>
        </div>
      </div>

      {/* Visor de Detalles (Enrutador Diferido) */}
      <ExcursionDetailModal 
        excursion={selectedExcursion} 
        onClose={() => setSelectedExcursion(null)} 
      />
    </section>
  );
};