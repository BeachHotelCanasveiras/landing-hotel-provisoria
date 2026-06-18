/// <reference types="@types/google.maps" />

/**
 * @file Testimonials.tsx
 * @description Sección de Prueba Social con integración nativa a la API oficial de Google Places.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-background, border-border, text-foreground y borderColor dinámico var(--accent) de la landing.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje, carga del SDK de Google Maps e inyección de reviews.
 * - Tipado estricto: Declaración global de la interfaz Window para evitar casteos a 'any'.
 * - Resiliencia Absoluta: Modelo de fusión híbrida Google Places + Diccionarios locales con protección tipo guardián (Failsafe) y caché TTL.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { HOTEL_CONFIG } from '@/const';
import { StorageService } from '@/lib/storage';
import { TestimonialsTranslationSchema, type TestimonialItem } from '@/locales/schemas/testimonials.schema';
import { 
  type CarouselApi, 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

// Declaración global segura (Duck Typing) para evitar el flag @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    google?: typeof google;
  }
}

const REVIEWS_CACHE_KEY = 'google_reviews_cache';
const CACHE_TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 días de vida útil en caché

export default function Testimonials() {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del carrusel de opiniones
  usePerformanceProfiler('Testimonials');

  const { t, i18n } = useTranslation('testimonials');
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [api, setApi] = useState<CarouselApi>();

  // ============================================================================
  // CONTRATO DE INTERFAZ (ZOD) - ISO 27001
  // ============================================================================
  if (import.meta.env.DEV) {
    try {
      const currentBundle = i18n.getResourceBundle(i18n.language, 'testimonials') || {};
      TestimonialsTranslationSchema.parse(currentBundle);
    } catch (error) {
      console.error(`[Testimonials Component] ❌ Error de integridad en el diccionario '${i18n.language}':`, error);
    }
  }

  useEffect(() => {
    const loadReviews = async () => {
      // 1. Intentar cargar desde el LocalStorage con TTL (7 días)
      const cachedData = StorageService.getLocalWithTTL<TestimonialItem[]>(REVIEWS_CACHE_KEY);
      
      // 🛡️ Guardián de Tipo (Failsafe): Evita de raíz que diccionarios corruptos o caídas de i18n rompan el renderizado
      const fallbackListRaw = t('fallback_reviews', { returnObjects: true });
      const fallbackList: TestimonialItem[] = Array.isArray(fallbackListRaw)
        ? (fallbackListRaw as TestimonialItem[])
        : [
            {
              author_name: "Carlos Rodríguez",
              profile_photo_url: "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/testimonials/avatar-cliente-chile.webp",
              rating: 5,
              text: "La ubicación es perfecta, a pasos de todo y con una calidez que nos hizo sentir como en casa en todo momento.",
              relative_time_description: "Hace un mes"
            },
            {
              author_name: "María López",
              profile_photo_url: "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/testimonials/avatar-cliente-argentina.webp",
              rating: 5,
              text: "Desayuno delicioso y atención impecable. Es el lugar ideal para desconectarse en familia.",
              relative_time_description: "Hace dos semanas"
            },
            {
              author_name: "Juan Martínez",
              profile_photo_url: "https://res.cloudinary.com/dap9ukdyq/image/upload/f_auto,q_auto/v1/beach-hotel/testimonials/avatar-cliente-uruguay.webp",
              rating: 5,
              text: "Excelente relación calidad-precio. La atención de todo el equipo fue maravillosa, volveremos pronto.",
              relative_time_description: "Hace tres meses"
            }
          ];
      
      if (cachedData && cachedData.length > 0) {
        // Fusión e instantaneidad
        setReviews(mergeAndDeduplicate(cachedData, fallbackList));
        return;
      }

      // 2. Extraer credenciales seguras
      const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const forgeBaseUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.manus.ai";
      const mapsProxyUrl = `${forgeBaseUrl}/v1/maps/proxy`;

      if (!apiKey) {
        console.warn("[Testimonials] Clave de API de Google Maps ausente en el entorno. Cargando fallbacks locales.");
        setReviews(fallbackList);
        return;
      }

      // 3. Consultar a la API de Google Places de forma asíncrona
      try {
        if (!window.google) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${mapsProxyUrl}/maps/api/js?key=${apiKey}&v=weekly&libraries=places`;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Error al cargar SDK de Google Maps"));
            document.head.appendChild(script);
          });
        }

        if (window.google) {
          const div = document.createElement('div');
          const service = new window.google.maps.places.PlacesService(div);

          service.getDetails({
            placeId: HOTEL_CONFIG.googlePlaceId,
            fields: ['reviews']
          }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.reviews) {
              
              const googleReviews: TestimonialItem[] = place.reviews.map((rev) => ({
                author_name: rev.author_name || 'Anónimo',
                profile_photo_url: rev.profile_photo_url || 'https://ui.shadcn.com/avatars/01.png',
                rating: rev.rating || 5,
                text: rev.text || '',
                relative_time_description: rev.relative_time_description || ''
              }));

              // Guardamos en caché por 7 días
              StorageService.setLocalWithTTL(REVIEWS_CACHE_KEY, googleReviews, CACHE_TTL_7_DAYS);
              setReviews(mergeAndDeduplicate(googleReviews, fallbackList));
            } else {
              setReviews(fallbackList);
            }
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error de red desconocido';
        console.warn("[Testimonials] Error al conectar con Google Places API. Activando fallback.", msg);
        setReviews(fallbackList);
      }
    };

    const mergeAndDeduplicate = (
      apiList: TestimonialItem[] | undefined | null, 
      fallbackList: TestimonialItem[] | undefined | null
    ): TestimonialItem[] => {
      const safeApiList = Array.isArray(apiList) ? apiList : [];
      const safeFallbackList = Array.isArray(fallbackList) ? fallbackList : [];
      
      const merged = [...safeApiList, ...safeFallbackList];
      const seen = new Set();
      return merged.filter(item => {
        if (!item || typeof item !== 'object' || !('author_name' in item)) return false;
        const author = item.author_name;
        const duplicate = seen.has(author);
        seen.add(author);
        return !duplicate;
      });
    };

    loadReviews();
  }, [i18n.language, t]);

  // Autoplay asíncrono para el carrusel infinito de Embla
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <section id="testimonials" className="py-20 bg-background overflow-hidden border-t border-border transition-colors duration-300">
      <div className="container px-4">
        
        {/* Cabecera */}
        <div className="text-center mb-12">
          <span className="inline-block px-5 py-1.5 bg-muted text-muted-foreground rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-border">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6 tracking-tight">
            {t('title')}
          </h2>
        </div>

        {/* Carrusel */}
        <Carousel 
          setApi={setApi}
          opts={{ align: "start", loop: true, duration: 45 }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  className="bg-muted/50 p-8 rounded-3xl border border-border h-full flex flex-col justify-between transition-all duration-300"
                  whileHover={{ y: -5, borderColor: 'var(--accent)' }} // 🚀 Borde dinámico de marca blanca
                >
                  <div className="mb-6">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed italic line-clamp-6 text-left">
                      "{testimonial.text}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-border">
                    <img 
                      src={testimonial.profile_photo_url} 
                      alt={testimonial.author_name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-card shadow-sm"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.currentTarget.src = 'https://ui.shadcn.com/avatars/01.png')}
                    />
                    <div className="text-left">
                      <h4 className="font-display text-base text-foreground font-semibold leading-tight">{testimonial.author_name}</h4>
                      {testimonial.relative_time_description && (
                        <p className="font-body text-[10px] text-accent font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                          <Globe size={10} className="text-muted-foreground" />
                          {testimonial.relative_time_description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="hidden md:flex justify-center mt-10 gap-4">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}