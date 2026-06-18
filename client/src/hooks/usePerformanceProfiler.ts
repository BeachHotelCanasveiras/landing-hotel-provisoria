/**
 * @file usePerformanceProfiler.ts
 * @description Hook de alto rendimiento para monitorear la latencia de montaje en React 19.
 * - Pureza: Cumple al 100% con las reglas de pureza de React 19 al no acceder a Refs ni llamar a funciones impuras en fase de renderizado.
 * - UX: Utiliza requestIdleCallback para reportar métricas de forma asíncrona sin bloquear el hilo principal.
 * - Trazabilidad: Emite la telemetría del tiempo transcurrido desde la carga de la página (Time to Mount).
 */

import { useEffect, useRef } from 'react';

interface ProfilerMetric {
  componentName: string;
  mountDurationMs: number; // Tiempo transcurrido desde la carga de la página hasta el montaje final
  timestamp: string;
}

/**
 * @function usePerformanceProfiler
 * @description Registra el tiempo de montaje físico de un componente de forma segura bajo StrictMode de React 19.
 */
export function usePerformanceProfiler(componentName: string) {
  // Inicializamos la ref sin valores mutados en la fase síncrona de renderizado
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Captura del tiempo en la fase asíncrona de montaje (fuera del render path)
    const now = performance.now();

    // El condicional dentro del efecto asegura la idempotencia en StrictMode (donde los efectos se ejecutan doblemente)
    if (startTimeRef.current === null) {
      startTimeRef.current = now;

      const metric: ProfilerMetric = {
        componentName,
        mountDurationMs: parseFloat(now.toFixed(3)),
        timestamp: new Date().toISOString(),
      };

      // Despacho asíncrono no intrusivo a hilos de navegador ociosos
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          reportMetric(metric);
        });
      } else {
        setTimeout(() => {
          reportMetric(metric);
        }, 0);
      }
    }
  }, [componentName]);
}

/**
 * @function reportMetric
 * @description Canaliza la telemetría. En producción, se puede reportar a un endpoint de logs centralizado.
 */
function reportMetric(metric: ProfilerMetric) {
  // En modo desarrollo, visualizamos las latencias limpiamente
  if (import.meta.env.DEV) {
    console.warn(
      `[Observability Layer] Componente <${metric.componentName}> montado tras: ${metric.mountDurationMs}ms desde la carga de página.`
    );
  } else {
    // Aquí puedes canalizar a tu servidor de analíticas en segundo plano de forma asíncrona
    // fetch('/api/telemetry/report', { method: 'POST', body: JSON.stringify(metric) }).catch(() => {});
  }
}