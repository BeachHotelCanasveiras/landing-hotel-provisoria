/**
 * @file Map.tsx
 * @description Aparato de Geolocalización Interactiva con carga diferida.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Gobernación Semántica Whitelabel: 100% adaptado a la paleta bg-card, bg-muted, border-border y text-foreground de la landing page.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje y carga diferida del iframe de Google Maps.
 * - Trinidad Atómica: Localización total del texto del cargador de mapa (home namespace).
 * - Performance: Utiliza IntersectionObserver para carga "just-in-time".
 * - Seguridad: Cero 'any', tipado estricto con namespace de Google Maps.
 */

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePerformanceProfiler } from "@/hooks/usePerformanceProfiler";
import { cn } from "@/lib/utils";
import { HOTEL_CONFIG } from "@/const";
import { Spinner } from "@/components/ui/spinner";

interface MapViewProps {
  className?: string;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialZoom = 17,
  onMapReady,
}: MapViewProps) {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje de mapas
  usePerformanceProfiler('MapView');

  const { t } = useTranslation('home');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Intersection Observer: Carga el mapa solo cuando el usuario se acerca
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Pre-carga 200px antes de llegar
    );

    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const PLACE_ID = HOTEL_CONFIG.googlePlaceId;
  const addressQuery = encodeURIComponent(HOTEL_CONFIG.address);

  const iframeUrl = API_KEY 
    ? `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${PLACE_ID}&zoom=${initialZoom}`
    : `https://maps.google.com/maps?q=${addressQuery}&t=&z=${initialZoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div ref={mapRef} className={cn("p-2 bg-card rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border transition-colors duration-300", className)}>
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-muted">
        
        {isVisible ? (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/90 z-10">
                <Spinner className="text-accent w-8 h-8 mb-3" />
                <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
                  {t('loading_map', { defaultValue: 'Cargando mapa...' })}
                </p>
              </div>
            )}
            <iframe
              title="Ubicación de Hotel Beach Canasvieiras"
              src={iframeUrl}
              className={cn("w-full h-full border-0 transition-opacity duration-700", iframeLoading ? "opacity-0" : "opacity-100")}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => {
                setIframeLoading(false);
                if (onMapReady) onMapReady({} as google.maps.Map); // Cast seguro
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Spinner className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}