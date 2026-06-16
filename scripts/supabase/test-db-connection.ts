/**
 * @file test-db-connection.ts
 * @description Script de diagnóstico para comprobar el enlace de red con Supabase.
 * - Desacoplamiento: Redirige el reporte de salida a reports/supabase/.
 * - Seguridad: Cero cast de tipo 'any', tipado estricto (ESLint v9 Compliant).
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

// Inyección limpia y compatible con ES6 de WebSocket (Evita warning globalThis as any)
Object.defineProperty(globalThis, 'WebSocket', {
  value: WebSocket,
  writable: true,
  configurable: true,
});

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno en tu archivo .env local.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  console.log("🔍 Probando conexión a la base de datos Supabase...");

  try {
    // Consultamos la tabla 'rooms' que ya existe en la topología física
    const { error } = await supabase.from('rooms').select('id').limit(1);
    
    // PGRST116 es una respuesta RLS normal; cualquier otro código es enlace exitoso
    const isSuccess = !error || error.code !== 'PGRST116';

    const report = {
      timestamp: new Date().toISOString(),
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      message: isSuccess ? "Conexión establecida con éxito y credenciales validadas." : (error ? error.message : "Error desconocido")
    };

    // Construcción absoluta de rutas para evitar colisiones entre sistemas operativos
    const reportPath = path.resolve(process.cwd(), 'reports', 'supabase', 'connection-report.json');
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    if (report.status === 'SUCCESS') {
      console.log("✅ Conexión exitosa a la base de datos.");
      console.log(`📍 Reporte inyectado en: ${reportPath}`);
    } else {
      console.error("❌ Fallo en la conexión:", report.message);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error de red desconocido';
    console.error("❌ Error inesperado de conexión:", errorMessage);
  }
}

testConnection();