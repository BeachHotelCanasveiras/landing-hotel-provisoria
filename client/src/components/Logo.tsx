/**
 * @file Logo.tsx
 * @description Componente de Identidad Visual del Hotel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - React 19 SsoT: Utiliza la propiedad nativa fetchPriority en camelCase, removiendo directivas @ts-expect-error.
 * - Observabilidad: Instrumentación con usePerformanceProfiler para trazas de latencia en montaje del logotipo.
 * - Optimización de Contraste: Picture contenedor responsivo con densidades físicas para pantallas Retina.
 */

import React from 'react';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import { cn } from '@/lib/utils';

/**
 * CONFIGURACIÓN DE ÉLITE - LOGOS DESDE CLOUDINARY
 * cloud_name: dap9ukdyq
 */
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload";
const PROJECT_PATH = "beach-hotel/logo";

/**
 * Genera la URL dinámica con transformaciones en la nube de Cloudinary.
 * @param name - Nombre del archivo/asset en Cloudinary.
 * @param width - Ancho en píxeles para redimensionamiento en servidor.
 */
const getCloudinaryUrl = (name: string, width: number) => {
  // f_auto, q_auto: Optimización inteligente de formato (AVIF/WebP) y peso.
  return `${CLOUDINARY_BASE}/f_auto,q_auto,w_${width}/v1/${PROJECT_PATH}/${name}`;
};

interface LogoProps {
  className?: string;
  variant?: 'logo-main' | 'logo-square';
  theme?: 'dark' | 'light';
}

export const Logo = ({ 
  className, 
  variant = 'logo-main', 
  theme = 'dark' 
}: LogoProps) => {
  // 📊 Capa de Telemetría: Registro asíncrono de latencia en montaje del logotipo
  usePerformanceProfiler('Logo');

  // El nombre del asset coincide exactamente con el public_id del inventario
  const assetName = `${variant}-${theme}`;

  return (
    <picture className={cn("inline-flex items-center justify-center", className)}>
      {/* 
          ESTRATEGIA DE DENSIDAD RESPONSIVA:
          Servimos 200px para móviles y 400px para pantallas Retina.
          Garantiza nitidez absoluta en la tipografía 'Head Heavy'.
      */}
      <source 
        media="(max-width: 768px)" 
        srcSet={`${getCloudinaryUrl(assetName, 200)} 1x, ${getCloudinaryUrl(assetName, 400)} 2x`} 
      />
      <img 
        src={getCloudinaryUrl(assetName, 400)} 
        alt="Hotel Beach Canasvieiras"
        /* h-full w-auto object-contain fuerza la herencia de escala proporcional del padre */
        className="h-full w-auto object-contain select-none pointer-events-none"
        draggable={false}
        loading="eager"
        fetchPriority="high" // 🚀 React 19 SsoT: Atributo nativo en camelCase sin bypasses
      />
    </picture>
  );
};