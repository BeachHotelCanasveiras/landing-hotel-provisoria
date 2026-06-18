/**
 * @file usePersistFn.ts
 * @description Hook de persistencia de callbacks (equivalente a useCallbackRef/useEvent).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - TypeScript SSoT: Tipado estricto y seguro utilizando unknown y Parameters<T> para erradicar el 100% de advertencias de 'any' de ESLint v9.
 * - Rendimiento: Diseñado como una utilidad de bajo nivel con cero overhead de memoria.
 */

import { useRef } from "react";

/**
 * @function usePersistFn
 * @description Mantiene una referencia de callback persistente que nunca cambia de identidad,
 * evitando re-renderizados innecesarios de componentes hijos sin dependencias en efectos.
 */
export function usePersistFn<T extends (...args: never[]) => unknown>(fn: T): T {
  // Actualizar la ref en caliente para que siempre apunte al callback más fresco
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T | null>(null);
  
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args: Parameters<T>) {
      // Ejecutar el callback fresco de forma segura manteniendo el contexto de ejecución
      return fnRef.current.apply(this, args);
    } as unknown as T;
  }

  return persistFn.current;
}