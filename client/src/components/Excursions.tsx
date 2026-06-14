/**
 * @file Excursions.tsx
 * @description Sección de Excursiones Propias (Fase de Exploración y Aventura).
 * Diseñado bajo la TÁCTICA HÍBRIDA de UX Premium y Carga Diferida (Lazy Loading):
 * - Auto-Scroll: Deslizamiento automático e interactivo cada 2 segundos.
 * - Desktop/Mobile: Carrusel de flujo infinito para mitigar por completo la fatiga por scroll.
 * - Detalle: Modal con sistema de pestañas diferidas (Info vs Ruta) y galería de fotos alternas.
 * - Rendimiento: El mapa (Iframe) solo se carga en memoria si el usuario selecciona la pestaña.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Compass, Clock, MapPin, CheckCircle2, MessageCircle, X, ChevronLeft, ChevronRight, Info, Eye } from 'lucide-react';
import { HOTEL_CONFIG } from '@/const';
import { cn } from '@/lib/utils';
import { ExcursionsTranslationSchema } from '@/locales/schemas/excursions.schema';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

// Se remueve la versión '/v1/' y se apunta al SSoT de la carpeta de excursiones
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/beach-hotel/excursiones/";

interface ExcursionConfig {
  key: 'city_tour' | 'beto_carrero' | 'ilha_campeche' | 'bombinhas' | 'guarda_embau' | 'joaquina';
  image: string;
  destinationName: string;
  mapMode: 'directions' | 'satellite' | 'hybrid';
  altImages: string[];
}

const EXCURSIONS_CONFIG: ExcursionConfig[] = [
  { 
    key: 'city_tour', 
    image: `${CLOUDINARY_BASE}city-tour.jpg`, 
    destinationName: "Centro Historico, Florianopolis, SC, Brasil", 
    mapMode: 'directions',
    altImages: [
      'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    key: 'beto_carrero', 
    image: `${CLOUDINARY_BASE}beto-carrero.jpg`, 
    destinationName: "Beto Carrero World, Penha, SC, Brasil", 
    mapMode: 'directions',
    altImages: [
      'https://images.unsplash.com/photo-1513885045260-6b3086b24c17?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    key: 'ilha_campeche', 
    image: `${CLOUDINARY_BASE}ilha-campeche.jpg`, 
    destinationName: "Ilha do Campeche, Florianopolis, SC, Brasil", 
    mapMode: 'satellite',
    altImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    key: 'bombinhas', 
    image: `${CLOUDINARY_BASE}bombinhas.jpg`, 
    destinationName: "Praia de Bombinhas, Bombinhas, SC, Brasil", 
    mapMode: 'hybrid',
    altImages: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    key: 'guarda_embau', 
    image: `${CLOUDINARY_BASE}guarda-embau.jpg`, 
    destinationName: "Guarda do Embau, Palhoca, SC, Brasil", 
    mapMode: 'satellite',
    altImages: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    key: 'joaquina', 
    image: `${CLOUDINARY_BASE}joaquina.jpg`, 
    destinationName: "Praia da Joaquina, Florianopolis, SC, Brasil", 
    mapMode: 'hybrid',
    altImages: [
      'https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80'
    ]
  },
];

export default function Excursions() {
  const { t, i18n } = useTranslation('excursions');
  const [selectedExcursion, setSelectedExcursion] = useState<ExcursionConfig | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'map'>('info');
  const [mapLoading, setMapLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  // ============================================================================
  // VALIDACIÓN DE INTEGRIDAD DEL ESQUEMA (ZOD)
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'excursions') || {};
      ExcursionsTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Excursions Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  // Auto-scroll reactivo cada 2 segundos con pausa inteligente si el modal está abierto
  useEffect(() => {
    if (!api || selectedExcursion) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [api, selectedExcursion]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!api) return;
    if (direction === 'left') {
      api.scrollPrev();
    } else {
      api.scrollNext();
    }
  };

  const openExcursionModal = (excursion: ExcursionConfig) => {
    setActiveTab('info');
    setMapLoading(true);
    setSelectedExcursion(excursion);
    setActivePhoto(excursion.image); // Inicializa con la foto de portada real en JPG
  };

  /**
   * Generador de URL de mapa a medida según el destino (Directions o Satélite)
   */
  const getMapUrl = (excursion: ExcursionConfig) => {
    const origin = encodeURIComponent(HOTEL_CONFIG.address);
    const dest = encodeURIComponent(excursion.destinationName);
    
    if (excursion.mapMode === 'directions') {
      return `https://maps.google.com/maps?saddr=${origin}&daddr=${dest}&t=m&z=10&output=embed`;
    } else if (excursion.mapMode === 'satellite') {
      return `https://maps.google.com/maps?q=${dest}&t=k&z=14&ie=UTF8&iwloc=&output=embed`;
    } else {
      return `https://maps.google.com/maps?q=${dest}&t=h&z=14&ie=UTF8&iwloc=&output=embed`;
    }
  };

  return (
    <section id="excursions" className="py-24 bg-white border-b border-gray-100">
      <div className="container px-4 sm:px-6">
        
        {/* Cabecera */}
        <div className="text-center mb-16 relative">
          <span className="inline-block px-5 py-1.5 bg-gray-50 text-gray-700 rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-gray-200/50">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-5 tracking-tight">
            {t('title')}
          </h2>
          <p className="font-body text-gray-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-light">
            {t('subtitle')}
          </p>

          <div className="hidden lg:flex absolute bottom-0 right-4 gap-2">
            <button 
              onClick={() => handleScroll('left')}
              className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200/60 transition-all active:scale-95 cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200/60 transition-all active:scale-95 cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CARRUSEL DE DESLIZAMIENTO INFINITO CON AUTO-PLAY */}
        <Carousel 
          setApi={setApi}
          opts={{ align: "start", loop: true, duration: 40 }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {EXCURSIONS_CONFIG.map((excursion) => {
              const name = t(`items.${excursion.key}.name`);
              const duration = t(`items.${excursion.key}.duration`);

              return (
                <CarouselItem key={excursion.key} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <motion.div
                    onClick={() => openExcursionModal(excursion)}
                    className="group cursor-pointer select-none bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-full"
                    whileHover={{ y: -5 }}
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
                        <h3 className="font-display text-2xl text-gray-900 mb-3 tracking-tight">
                          {name}
                        </h3>
                        <p className="font-body text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                          {t(`items.${excursion.key}.description`)}
                        </p>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Evita doble ejecución al hacer clic en el botón
                          openExcursionModal(excursion);
                        }}
                        className="w-full h-12 bg-gray-50 hover:bg-accent hover:text-accent-foreground text-gray-700 border border-gray-100 rounded-full font-body text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </motion.div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div className="flex lg:hidden justify-center items-center gap-1.5 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <p className="font-body text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Desliza para ver más excursiones
          </p>
        </div>

      </div>

      {/* MODAL MULTI-PESTAÑA DIFERIDO (LAZY LOADING) CON GALERÍA COOPERATIVA */}
      <Dialog open={!!selectedExcursion} onOpenChange={() => setSelectedExcursion(null)}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl z-[100]">
          {selectedExcursion && (
            <div>
              
              {/* Imagen de Cabecera Dinámica según selección de la galería */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={activePhoto || selectedExcursion.image}
                  alt={t(`items.${selectedExcursion.key}.name`)}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <button
                  onClick={() => setSelectedExcursion(null)}
                  className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all active:scale-90"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-900 px-3.5 py-1.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider shadow-xs">
                    <Clock size={11} className="text-accent" />
                    {t(`items.${selectedExcursion.key}.duration`)}
                  </span>
                </div>
              </div>

              {/* Selector de Pestañas Minimalista de Alta Costura */}
              <div className="flex border-b border-gray-100 px-8 pt-4 bg-gray-50/50">
                <button
                  onClick={() => setActiveTab('info')}
                  className={cn(
                    "flex-1 pb-3 text-xs font-body font-bold uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer",
                    activeTab === 'info' 
                      ? "border-accent text-gray-950 font-bold" 
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Info size={14} />
                  Información
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={cn(
                    "flex-1 pb-3 text-xs font-body font-bold uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer",
                    activeTab === 'map' 
                      ? "border-accent text-gray-950 font-bold" 
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Eye size={14} />
                  Ruta y Mapa
                </button>
              </div>

              {/* Contenido Dinámico de la Pestaña Activa */}
              <div className="p-8">
                
                {activeTab === 'info' ? (
                  /* PESTAÑA 1: INFORMACIÓN GENERAL */
                  <div className="space-y-6">
                    <div>
                      <DialogTitle className="font-display text-2xl text-gray-900 mb-2 tracking-tight">
                        {t(`items.${selectedExcursion.key}.name`)}
                      </DialogTitle>
                      <p className="font-body text-xs text-accent uppercase tracking-[0.15em] font-semibold">
                        Excursión Exclusiva del Hotel
                      </p>
                    </div>
                    
                    <p className="font-body text-sm text-gray-600 leading-relaxed font-light">
                      {t(`items.${selectedExcursion.key}.description`)}
                    </p>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Compass size={12} className="text-accent" />
                        Qué incluye la experiencia
                      </p>
                      <p className="font-body text-xs text-gray-700 leading-relaxed font-medium">
                        {t(`items.${selectedExcursion.key}.includes`)}
                      </p>
                    </div>

                    {/* GALERÍA DE IMÁGENES ALTERNATIVAS */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        Más fotografías del destino
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {/* Miniatura de la Foto Principal */}
                        <button
                          onClick={() => setActivePhoto(selectedExcursion.image)}
                          className={cn(
                            "relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all duration-300",
                            (activePhoto === selectedExcursion.image || !activePhoto)
                              ? "border-accent scale-95 shadow-md" 
                              : "border-transparent opacity-70 hover:opacity-100"
                          )}
                        >
                          <img 
                            src={selectedExcursion.image} 
                            alt="Foto principal" 
                            className="w-full h-full object-cover" 
                          />
                        </button>
                        
                        {/* Miniaturas de Fotos Alternativas */}
                        {selectedExcursion.altImages.map((imgUrl, i) => (
                          <button
                            key={i}
                            onClick={() => setActivePhoto(imgUrl)}
                            className={cn(
                              "relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all duration-300",
                              activePhoto === imgUrl 
                                ? "border-accent scale-95 shadow-md" 
                                : "border-transparent opacity-70 hover:opacity-100"
                            )}
                          >
                            <img 
                              src={imgUrl} 
                              alt={`Foto alternativa ${i + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PESTAÑA 2: MAPA DINÁMICO (Carga diferida para proteger el rendimiento) */
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-display text-xl text-gray-900 mb-1 tracking-tight">
                        {selectedExcursion.mapMode === 'directions' ? 'Ruta sugerida desde el Hotel' : 'Vista aérea de destino'}
                      </h4>
                      <p className="font-body text-xs text-gray-400 font-light">
                        {selectedExcursion.mapMode === 'directions' 
                          ? 'Trayecto optimizado en coche sin intermediarios.' 
                          : 'Explora la geografía costera del destino en alta definición.'}
                      </p>
                    </div>

                    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 shadow-inner">
                      {mapLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10">
                          <Spinner className="text-accent w-8 h-8 mb-2" />
                          <p className="font-body text-[10px] text-gray-400 uppercase tracking-widest">
                            Conectando con satélite...
                          </p>
                        </div>
                      )}
                      <iframe
                        title={`Mapa de ${t(`items.${selectedExcursion.key}.name`)}`}
                        src={getMapUrl(selectedExcursion)}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        onLoad={() => setMapLoading(false)}
                      />
                    </div>
                  </div>
                )}

                {/* WhatsApp CTA (Permanente abajo del modal como principal objetivo del embudo) */}
                <div className="mt-8">
                  <Button
                    onClick={() => {
                      const message = t('whatsapp_template', { name: t(`items.${selectedExcursion.key}.name`) });
                      window.open(`${HOTEL_CONFIG.whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-body font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    {t('cta_whatsapp')}
                  </Button>
                </div>

              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

    </section>
  );
}