/// <reference types="@types/google.maps" />

/**
 * @file Testimonials.tsx
 * @description Sección de Prueba Social con integración nativa a la API oficial de Google Places.
 * - Consume claves de API de forma segura y dinámica exclusivamente desde las variables del entorno (VITE_).
 * - Utiliza el proxy seguro de Manus como puente para evitar la exposición de credenciales al público (ISO 27001).
 * - Implementa caché del lado del cliente de 7 días (TTL) mediante StorageService.
 * - Sistema de "Fusión Híbrida": Mezcla reseñas reales de Google con fallbacks locales de alta calidad.
 * - Carrusel con bucle infinito y autoplay fluido asíncrono con Embla.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

const REVIEWS_CACHE_KEY = 'google_reviews_cache';
const CACHE_TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

export default function Testimonials() {
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
      console.error(`[Testimonials Component] ❌ Error de integridad en diccionario '${i18n.language}':`, error);
    }
  }

  useEffect(() => {
    const loadReviews = async () => {
      // 1. Intentar cargar desde el LocalStorage con TTL (7 días)
      const cachedData = StorageService.getLocalWithTTL<TestimonialItem[]>(REVIEWS_CACHE_KEY);
      const fallbackList = t('fallback_reviews', { returnObjects: true }) as TestimonialItem[];
      
      if (cachedData && cachedData.length > 0) {
        // Fusionar datos de caché con fallbacks de traducción para un carrusel extenso
        setReviews(mergeAndDeduplicate(cachedData, fallbackList));
        return;
      }

      // 2. Extraer credenciales seguras de las variables del entorno del dispositivo (.env)
      const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const forgeBaseUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.manus.ai";
      const mapsProxyUrl = `${forgeBaseUrl}/v1/maps/proxy`;

      if (!apiKey) {
        console.warn("[Testimonials] Clave de API de Google Maps ausente en el entorno. Cargando fallbacks.");
        setReviews(fallbackList);
        return;
      }

      // 3. Consultar a la API de Google Places de forma asíncrona y no bloqueante
      try {
        if (!(window as any).google) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${mapsProxyUrl}/maps/api/js?key=${apiKey}&v=weekly&libraries=places`;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Error al cargar SDK de Google Maps"));
            document.head.appendChild(script);
          });
        }

        const div = document.createElement('div');
        const service = new google.maps.places.PlacesService(div);

        service.getDetails({
          placeId: HOTEL_CONFIG.googlePlaceId,
          fields: ['reviews']
        }, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.reviews) {
            
            const googleReviews: TestimonialItem[] = place.reviews.map((rev) => ({
              author_name: rev.author_name || 'Anónimo',
              profile_photo_url: rev.profile_photo_url || 'https://ui.shadcn.com/avatars/01.png',
              rating: rev.rating || 5,
              text: rev.text || '',
              relative_time_description: rev.relative_time_description || ''
            }));

            // Guardamos exclusivamente el payload de Google en caché por 7 días
            StorageService.setLocalWithTTL(REVIEWS_CACHE_KEY, googleReviews, CACHE_TTL_7_DAYS);
            setReviews(mergeAndDeduplicate(googleReviews, fallbackList));
          } else {
            setReviews(fallbackList);
          }
        });
      } catch (err) {
        console.warn("[Testimonials] Error al conectar con Google Places API. Activando fallback.", err);
        setReviews(fallbackList);
      }
    };

    /**
     * Une las opiniones dinámicas de Google con las estáticas locales,
     * eliminando duplicados basados en el nombre del autor.
     */
    const mergeAndDeduplicate = (apiList: TestimonialItem[], fallbackList: TestimonialItem[]): TestimonialItem[] => {
      const merged = [...apiList, ...fallbackList];
      const seen = new Set();
      return merged.filter(item => {
        const duplicate = seen.has(item.author_name);
        seen.add(item.author_name);
        return !duplicate;
      });
    };

    loadReviews();
  }, [i18n.language]);

  // Autoplay asíncrono para el carrusel infinito de Embla
  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden border-t border-gray-50">
      <div className="container px-4">
        
        {/* Cabecera */}
        <div className="text-center mb-12">
          <span className="inline-block px-5 py-1.5 bg-gray-100 text-gray-800 rounded-full text-[10px] font-body font-semibold uppercase tracking-[0.2em] mb-4 border border-gray-200/50">
            {t('badge')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-gray-900 mb-6 tracking-tight">
            {t('title')}
          </h2>
        </div>

        {/* Carrusel con bucle infinito activado */}
        <Carousel 
          setApi={setApi}
          opts={{ align: "start", loop: true, duration: 45 }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((t, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div 
                  className="bg-gray-50 p-8 rounded-3xl border border-gray-100 h-full flex flex-col justify-between"
                  whileHover={{ y: -5, borderColor: '#d4a574' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="font-body text-gray-700 text-sm leading-relaxed italic line-clamp-6">
                      "{t.text}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <img 
                      src={t.profile_photo_url} 
                      alt={t.author_name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.currentTarget.src = 'https://ui.shadcn.com/avatars/01.png')}
                    />
                    <div>
                      <h4 className="font-display text-base text-gray-900 font-semibold leading-tight">{t.author_name}</h4>
                      {t.relative_time_description && (
                        <p className="font-body text-[10px] text-accent font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                          <Globe size={10} className="text-gray-400" />
                          {t.relative_time_description}
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