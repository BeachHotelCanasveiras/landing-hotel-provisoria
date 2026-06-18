/**
 * @file useComposition.ts
 * @description Hook de control de bajo nivel para capturar estados de composición IME del teclado (Safari-safe).
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Saneamiento: Inyección de useEffect de limpieza para liberar temporizadores anidados en el desmontaje (evita memory leaks).
 * - Observabilidad: Trazas pasivas de cambio de estado de composición para depuración de entrada.
 * - TypeScript SSoT: Tipado estricto e inmutable bajo contratos genéricos libres de aserciones 'any' para ESLint v9.
 */

import { useRef, useEffect } from "react"; // 🚀 Saneado: useEffect importado para limpieza de memoria
import { usePersistFn } from "./usePersistFn";

export interface UseCompositionReturn<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onCompositionStart: React.CompositionEventHandler<T>;
  onCompositionEnd: React.CompositionEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  isComposing: () => boolean;
}

export interface UseCompositionOptions<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onKeyDown?: React.KeyboardEventHandler<T>;
  onCompositionStart?: React.CompositionEventHandler<T>;
  onCompositionEnd?: React.CompositionEventHandler<T>;
}

type TimerResponse = ReturnType<typeof setTimeout>;

export function useComposition<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(options: UseCompositionOptions<T> = {}): UseCompositionReturn<T> {
  const {
    onKeyDown: originalOnKeyDown,
    onCompositionStart: originalOnCompositionStart,
    onCompositionEnd: originalOnCompositionEnd,
  } = options;

  const c = useRef(false);
  const timer = useRef<TimerResponse | null>(null);
  const timer2 = useRef<TimerResponse | null>(null);

  // 🚀 LIBERACIÓN DE MEMORIA: Limpiar temporizadores pendientes al desmontar el componente (ISO 27001)
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (timer2.current) clearTimeout(timer2.current);
    };
  }, []);

  const onCompositionStart = usePersistFn((e: React.CompositionEvent<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (timer2.current) {
      clearTimeout(timer2.current);
      timer2.current = null;
    }
    c.current = true;

    // 📊 Traza de Observabilidad: Comienzo de composición IME
    if (import.meta.env.DEV) {
      console.log(`[Composition Hook] Composición IME iniciada (c: ${c.current})`);
    }

    originalOnCompositionStart?.(e);
  });

  const onCompositionEnd = usePersistFn((e: React.CompositionEvent<T>) => {
    // Usar dos capas de setTimeout para procesar la latencia de confirmación del motor de render de Safari
    timer.current = setTimeout(() => {
      timer2.current = setTimeout(() => {
        c.current = false;

        // 📊 Traza de Observabilidad: Fin de composición IME
        if (import.meta.env.DEV) {
          console.log(`[Composition Hook] Composición IME finalizada de forma asíncrona (c: ${c.current})`);
        }
      });
    });
    originalOnCompositionEnd?.(e);
  });

  const onKeyDown = usePersistFn((e: React.KeyboardEvent<T>) => {
    // En estado de composición activa, bloquear la propagación de eventos ESC y Enter (sin Shift)
    if (
      c.current &&
      (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey))
    ) {
      e.stopPropagation();
      return;
    }
    originalOnKeyDown?.(e);
  });

  const isComposing = usePersistFn(() => {
    return c.current;
  });

  return {
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
    isComposing,
  };
}