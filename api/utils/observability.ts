/**
 * @file observability.ts
 * @description Decorador de orden superior (Middleware) para observabilidad serverless en Vercel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Seguridad (ISO 27001): Registro correlativo de la dirección IP de origen y del User-Agent.
 * - Latencia: Medición de alta resolución importando nativamente "performance" desde perf_hooks.
 * - Contención: Enmascaramiento preventivo de excepciones unhandled hacia el cliente para evitar fugas de secretos.
 * - Zero-Overhead: Vuelca JSON estructurado a stdout para ser consumido de forma asíncrona por Vercel Log Drains.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { performance } from 'perf_hooks'; // 🚀 Saneamiento: Importación nativa para evitar advertencias de tipado ambiental

export type ServerlessHandler = (
  req: VercelRequest,
  res: VercelResponse,
  context: { traceId: string }
) => Promise<unknown>;

/**
 * @function withObservability
 * @description Encapsulador de seguridad, observabilidad y rendimiento para funciones Serverless en Vercel.
 */
export function withObservability(handler: ServerlessHandler) {
  return async function wrappedHandler(req: VercelRequest, res: VercelResponse) {
    const start = performance.now();
    const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
    
    // Obtener metadatos básicos del request para contextualizar la traza
    const path = req.url || 'unknown';
    const method = req.method || 'unknown';

    // 🚀 ISO 27001: Captura de dirección IP de origen de forma segura (Edge-Aware)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
                     req.socket.remoteAddress || 
                     'unknown';

    try {
      // Registrar inicio de la transacción serverless con contexto perimetral completo
      console.log(
        JSON.stringify({
          event: 'API_START',
          traceId,
          timestamp: new Date().toISOString(),
          method,
          path,
          clientIp,
          userAgent: req.headers['user-agent'] || 'unknown',
        })
      );

      // Ejecutar el handler real del endpoint
      const result = await handler(req, res, { traceId });

      const duration = performance.now() - start;

      // Registrar finalización exitosa con métricas de rendimiento exactas
      console.log(
        JSON.stringify({
          event: 'API_SUCCESS',
          traceId,
          timestamp: new Date().toISOString(),
          method,
          path,
          latencyMs: parseFloat(duration.toFixed(3)),
          status: res.statusCode || 200,
        })
      );

      return result;
    } catch (error: unknown) {
      const duration = performance.now() - start;
      const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido';
      const errorStack = error instanceof Error ? error.stack : undefined;

      // 🚨 CONTROL DE EXCEPCIONES: Registrar el error completo en stderr de forma interna
      console.error(
        JSON.stringify({
          event: 'API_FAILURE',
          traceId,
          timestamp: new Date().toISOString(),
          method,
          path,
          clientIp,
          latencyMs: parseFloat(duration.toFixed(3)),
          error: errorMessage,
          stack: errorStack,
        })
      );

      // Enmascarar error hacia el cliente para evitar fugas de información de tablas o secretos (ISO 27001)
      if (!res.writableEnded) {
        res.status(500).json({
          message: 'Ocurrió una inconsistencia de red en el servidor de transacciones.',
          traceId, // El cliente recibe el ID para que soporte técnico ubique el log de error de inmediato en Axiom
        });
      }
    }
  };
}