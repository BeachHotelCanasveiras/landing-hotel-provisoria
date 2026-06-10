/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { HOTEL_CONFIG } from "@/const";

declare global {
  interface Window {
    google?: typeof google;
  }
}

// Configuración de infraestructura (Proxy de seguridad Manus)
const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.manus.ai";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(null);
      return;
    }
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(null);
    script.onerror = () => reject(new Error("Error al cargar Google Maps"));
    document.head.appendChild(script);
  });
}

interface MapViewProps {
  className?: string;
  // Coordenadas exactas para Avenida das Nações 375, Canasvieiras
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: -27.4266, lng: -48.4518 }, // Ubicación rectificada
  initialZoom = 17, // Zoom de nivel calle
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
      
      if (!mapContainer.current || !window.google) return;

      // Inicialización del Mapa
      mapRef.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapId: "HOTEL_LOCATION_MAP", // Requerido para marcadores avanzados
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        gestureHandling: "cooperative", // Mejor UX en móvil para no "atrapar" el scroll
      });

      // Agregar Marcador del Hotel
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      
      const pin = new PinElement({
        background: "#0F3B66", // Azul corporativo del hotel
        borderColor: "#FFFFFF",
        glyphColor: "#FFFFFF",
      });

      new AdvancedMarkerElement({
        map: mapRef.current,
        position: initialCenter,
        title: HOTEL_CONFIG.fullName,
        content: pin.element,
      });

      if (onMapReady) {
        onMapReady(mapRef.current);
      }
    } catch (error) {
      console.error("Error inicializando el mapa:", error);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div 
      ref={mapContainer} 
      className={cn(
        "w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-inner border border-gray-100", 
        className
      )} 
    />
  );
}