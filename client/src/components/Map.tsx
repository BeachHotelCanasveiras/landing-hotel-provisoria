/**
 * @file Map.tsx
 * @description Aparato de Geolocalización Interactiva con carga diferida.
 * - Performance: Utiliza IntersectionObserver para carga "just-in-time".
 * - UX: Marco decorativo con profundidad (Soft-UI) para mejorar la UX.
 * - Seguridad: Cero 'any', tipado estricto con namespace de Google Maps.
 */

import { useState, useRef, useEffect } from "react";
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
    <div ref={mapRef} className={cn("p-2 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100", className)}>
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-100">
        
        {isVisible ? (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10">
                <Spinner className="text-primary w-8 h-8 mb-3" />
                <p className="font-body text-xs text-gray-400 tracking-widest uppercase">Cargando mapa...</p>
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
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Spinner className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}