// client/src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  className?: string;
  fill?: string;
  withIcon?: boolean;
}

export const Logo = ({ className = "h-12", fill = "currentColor", withIcon = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {withIcon && (
        <svg viewBox="0 0 500 500" className="h-full w-auto" fill={fill} xmlns="http://www.w3.org/2000/svg">
          {/* Path de la ola corporativa */}
          <path d="M50,300 C150,150 250,150 350,300 C420,380 480,380 490,300 C400,200 300,200 250,280" />
        </svg>
      )}
      <div className="flex flex-col justify-center leading-[1]">
        <span className="brand-logo text-2xl font-extrabold tracking-tight text-blue-900 whitespace-nowrap">
          Hotel Beach
        </span>
        <span className="brand-logo text-[10px] font-semibold tracking-[0.2em] text-blue-800 uppercase whitespace-nowrap">
          Canasvieiras
        </span>
      </div>
    </div>
  );
};