/**
 * @file useIsMobile.ts
 * @description Hook reactivo para la detección del punto de quiebre (breakpoint) móvil.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - Evita renderizados en cascada síncronos inicializando el estado de forma perezosa (Lazy State).
 * - Satisface plenamente las directivas de pureza de efectos de React 19.
 * - Soporte seguro para entornos híbridos/SSR.
 */

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Inicialización perezosa: Calcula el estado correcto en el primer renderizado
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
    }
    return false; // Fallback seguro para Server-Side Rendering (SSR)
  });

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    mql.addEventListener("change", onChange);
    
    // Eliminada la llamada síncrona a setIsMobile aquí para evitar el renderizado en cascada síncrono

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}