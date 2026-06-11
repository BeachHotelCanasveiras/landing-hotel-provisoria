import React from 'react';
import { cn } from '@/lib/utils';

/**
 * CONFIGURACIÓN DE ÉLITE - LOGOS DESDE CLOUDINARY
 * cloud_name: dap9ukdyq
 */
const CLOUDINARY_BASE = "https://res.cloudinary.com/dap9ukdyq/image/upload";
const PROJECT_PATH = "beach-hotel/logo";

const getCloudinaryUrl = (name: string, width: number) => {
  // f_auto, q_auto: Optimización de formato y calidad
  // w_X: Redimensionamiento dinámico para performance
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
  // El nombre del asset coincide exactamente con el public_id del inventario
  const assetName = `${variant}-${theme}`;

  return (
    <picture className={cn("inline-block", className)}>
      {/* 
          ESTRATEGIA DE DENSIDAD:
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
        className="h-12 md:h-16 w-auto object-contain select-none pointer-events-none"
        draggable={false}
        loading="eager"
        // @ts-ignore
        fetchpriority="high"
      />
    </picture>
  );
};