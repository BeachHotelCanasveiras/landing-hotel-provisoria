/// <reference types="@types/google.maps" />

/**
 * @file Map.tsx
 * @description Aparato de Geolocalización Interactiva Premium.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Desacoplado al 100% de proxies de terceros (Manus).
 * - Cero Hardcoding: Lee credenciales de forma segura desde las variables de entorno.
 * - Sistema Dual: Utiliza la API de Google Maps Embed oficial si se provee la clave;
 *   de lo contrario, se degrada a un fallback nativo basado en la dirección física (SSoT).
 * - UX Fluida: Transiciones suaves que ocultan el parpadeo de carga del iframe.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HOTEL_CONFIG } from "@/const";
import { Spinner } from "@/components/ui/spinner";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: any) => void;
}

export function MapView({
  className,
  initialZoom = 17,
  onMapReady,
}: MapViewProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  // 1. Recuperar variables de entorno de forma segura
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const PLACE_ID = HOTEL_CONFIG.googlePlaceId;
  const addressQuery = encodeURIComponent(HOTEL_CONFIG.address);

  // 2. Construcción de la URL del Iframe de Google Maps
  // Si existe API Key, cargamos la API oficial de Embed, de lo contrario usamos el buscador libre.
  const iframeUrl = API_KEY 
    ? `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${PLACE_ID}&zoom=${initialZoom}`
    : `https://maps.google.com/maps?q=${addressQuery}&t=&z=${initialZoom}&ie=UTF8&iwloc=&output=embed`;

  const handleOnLoad = () => {
    setIframeLoading(false);
    // Callback de compatibilidad en caso de ser requerido por el orquestador
    if (onMapReady) {
      onMapReady(null);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden bg-gray-50 transition-all duration-500",
        className
      )}
    >
      {/* 3. Pantalla de carga inteligente (Evita el fondo blanco mientras Google renderiza) */}
      {iframeLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-xs z-10 transition-all duration-300">
          <Spinner className="text-primary w-8 h-8 mb-3" />
          <p className="font-body text-xs text-gray-400 tracking-widest uppercase">
            Cargando mapa...
          </p>
        </div>
      )}

      {/* 4. Google Maps Embed Iframe con fade-in controlado */}
      <iframe
        title="Ubicación de Hotel Beach Canasvieiras"
        src={iframeUrl}
        className={cn(
          "w-full h-full border-0 transition-opacity duration-700 ease-in-out",
          iframeLoading ? "opacity-0" : "opacity-100"
        )}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={handleOnLoad}
      />
    </div>
  );
}