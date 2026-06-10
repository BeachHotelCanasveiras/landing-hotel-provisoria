import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  fill?: string; // Propiedad añadida para corregir TS2322
  withIcon?: boolean;
}

export const Logo = ({ className, fill = "black", withIcon = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Isotipo SVG: Ola Oficial Rectificada */}
      {withIcon && (
        <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M50,220 C150,220 220,50 380,50 C450,50 480,120 490,160 C420,80 320,90 270,180 C220,270 150,280 50,220 Z" 
              fill={fill}
            />
          </svg>
        </div>
      )}

      {/* Construcción Tipográfica: Alineación Geométrica */}
      <div className="flex flex-col">
        <h1 
          className="brand-logo text-[26px] md:text-[34px] font-extrabold leading-none tracking-[-0.03em]"
          style={{ color: fill }}
        >
          Hotel <span className="inline-block">Beach</span>
        </h1>
        <div className="flex justify-end w-full">
          <span 
            className="brand-logo text-[12px] md:text-[15px] font-bold tracking-[0.05em] leading-none mt-1"
            style={{ color: fill }}
          >
            Canasvieiras
          </span>
        </div>
      </div>
    </div>
  );
};