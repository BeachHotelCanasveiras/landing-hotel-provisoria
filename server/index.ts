/**
 * @file index.ts
 * @description Servidor de producción Express optimizado para la entrega de activos estáticos y ruteo SPA.
 * Refactorizado bajo el MANIFIESTO DE NIVELACIÓN:
 * - Seguridad Transaccional: Implementación manual de cabeceras HTTP restrictivas (HSTS, clickjacking, sniffing) para ISO 27001 y PCI-DSS.
 * - Observabilidad: Middleware de red integrado para rastreo de latencias y traceId en logs estructurados JSON (DevOps logs).
 * - TypeScript SSoT: Tipado estricto e inmaculado de interfaces express (Request, Response, NextFunction).
 */

import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto"; // Criptografía nativa para identificadores correlativos

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ============================================================================
  // 1. CAPA DE SEGURIDAD TRANSACCIONAL (ISO 27001 & PCI-DSS Compliance)
  // ============================================================================
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Frame-Options", "DENY"); // Evita clickjacking en formularios de reserva
    res.setHeader("X-Content-Type-Options", "nosniff"); // Previene inyección de scripts por tipo MIME
    res.setHeader("X-XSS-Protection", "1; mode=block"); // Filtro contra scripting malicioso
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Forzar HTTPS (HSTS) en entornos de producción reales
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }
    next();
  });

  // ============================================================================
  // 2. CAPA DE OBSERVABILIDAD DE RED (Rendimiento y Trazabilidad Asíncrona)
  // ============================================================================
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    // Reutilizar traceId del cliente o generar uno nuevo para correlacionar flujos
    const traceId = (req.headers["x-trace-id"] as string) || randomUUID();
    res.setHeader("X-Trace-Id", traceId);

    // Registro estructurado de inicio de solicitud de activo
    console.log(
      JSON.stringify({
        event: "SERVER_REQ_START",
        traceId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      })
    );

    // Escuchar el término de la respuesta para medir la latencia final
    res.on("finish", () => {
      const duration = performance.now() - start;
      console.log(
        JSON.stringify({
          event: "SERVER_REQ_END",
          traceId,
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          latencyMs: parseFloat(duration.toFixed(3)),
        })
      );
    });

    next();
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(
      JSON.stringify({
        event: "SERVER_INITIALIZED",
        timestamp: new Date().toISOString(),
        message: `Servidor PMS y Landing Page operativo de forma segura en: http://localhost:${port}/`,
        port,
      })
    );
  });
}

startServer().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : "Fallo desconocido";
  console.error(
    JSON.stringify({
      event: "SERVER_BOOT_CRITICAL_FAILURE",
      timestamp: new Date().toISOString(),
      error: errorMessage,
    })
  );
  process.exit(1);
});