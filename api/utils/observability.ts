/**
 * @file observability.ts
 * @description Decorador de orden superior (Middleware) para observabilidad serverless en Vercel.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Seguridad (ISO 27001): Registro correlativo de la dirección IP de origen y del User-Agent.
 * - Latencia: Medición de alta resolución importando nativamente "performance" desde perf_hooks.
 * - Contención: Enmascaramiento preventivo de excepciones unhandled hacia el cliente para evitar fugas de secretos.
 * - Zero-Overhead: Vuelca JSON estructurado a stdout para ser consumido de forma asíncrona por Vercel Log Drains.
 * - Saneamiento ESLint & TS: Resuelto conflicto de tipos ts(2430) y eliminado 'as any' usando aserciones seguras.
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
 * Interfaz de respaldo para resolver propiedades de conexión heredadas (legacy) sin herencia conflictiva ni tipo 'any'.
 */
interface LegacyConnection {
  connection?: {
    remoteAddress?: string;
  };
}

/**
 * @function withObservability
 * @description Encapsulador de seguridad, observabilidad y rendimiento para funciones Serverless en Vercel.
 */
export function withObservability(handler: ServerlessHandler) {
  return async function wrappedHandler(req: VercelRequest, res: VercelResponse) {
    const start = performance.now();
    const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
    
    // Obtener metadatos básicos de forma segura y defensiva
    const path = req?.url || 'unknown';
    const method = req?.method || 'unknown';

    // Conversión segura de dos pasos para resolver connection de forma limpia
    const legacyReq = req as unknown as LegacyConnection;

    // 🚀 ISO 27001: Captura de dirección IP de origen de forma segura y tolerante a entornos Serverless (Safe Fallbacks)
    const clientIp = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0].trim() || 
                     (req?.headers?.['x-real-ip'] as string)?.trim() ||
                     req?.socket?.remoteAddress || 
                     legacyReq?.connection?.remoteAddress ||
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
          userAgent: req?.headers?.['user-agent'] || 'unknown',
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
          status: res?.statusCode || 200,
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
      if (res && !res.writableEnded) {
        res.status(500).json({
          message: 'Ocurrió una inconsistencia de red en el servidor de transacciones.',
          traceId, // El cliente recibe el ID para que soporte técnico ubique el log de error de inmediato en Axiom
        });
      }
    }
  };
}