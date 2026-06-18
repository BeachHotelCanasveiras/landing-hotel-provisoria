/**
 * @file useMobile.tsx
 * @description Hook de alto rendimiento para la detección del punto de quiebre (breakpoint) móvil.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN y las mejores prácticas de React 19:
 * - useSyncExternalStore: Utiliza el gancho oficial de React 18+ para sincronizar con APIs externas del navegador,
 *   erradicando de raíz renderizados en cascada, tearing visual en Concurrent Mode y fugas de suscripción.
 * - Soporte SSR/SSG Seguro: Inyecta getServerSnapshot para evitar de raíz advertencias de hidratación en producción.
 * - Zero Redundant Listeners: Centraliza la suscripción al matchMedia del navegador de forma ultra-ligera.
 */

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

// 1. Snapshot: Leer el estado del viewport de forma síncrona e inmutable
const getSnapshot = () => {
  if (typeof window !== "undefined") {
    return window.matchMedia(query).matches;
  }
  return false;
};

// 2. Server Snapshot: Fallback estático seguro para Server-Side Rendering (Evita de raíz errores de hidratación)
const getServerSnapshot = () => false;

// 3. Subscribe: Sincronizar e instrumentar el escuchador de eventos de cambio del navegador
const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  const mql = window.matchMedia(query);
  
  // Soporte universal para navegadores antiguos y modernos
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", onChange);

  function onChange() {
    callback();
  }
};

/**
 * @function useIsMobile
 * @description Hook reactivo que detecta de forma pura si la ventana física se encuentra bajo el breakpoint móvil.
 */
export function useIsMobile(): boolean {
  // useSyncExternalStore maneja de manera nativa la caché, suscripción y re-renderizado concurrente
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}