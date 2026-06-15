/**
 * @file db-dump.ts
 * @description Script de volcado, respaldo y auditoría de datos de Supabase.
 * - ISO 27001: Auditoría de consistencia de registros y trazabilidad de datos.
 * - ESLint 9 Compliant: Tipado estricto libre de 'any'.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

// Inyección limpia de WebSocket para evitar fallos de Realtime en Node.js < v22
Object.defineProperty(globalThis, 'WebSocket', {
  value: WebSocket,
  writable: true,
  configurable: true,
});

interface DumpReport {
  timestamp: string;
  database_url: string;
  data: Record<string, unknown>;
}

async function dumpDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: Faltan variables de entorno en tu .env locales.");
    return;
  }

  // Inicialización con privilegios administrativos
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log("=================================================");
  console.log("📥 INICIANDO VOLCADO COMPLETO DE BASE DE DATOS");
  console.log("=================================================");
  console.log(`🔌 URL Conectada: ${supabaseUrl}\n`);

  const tables = ['users', 'guests', 'rooms', 'bookings'];
  const dump: DumpReport = {
    timestamp: new Date().toISOString(),
    database_url: supabaseUrl,
    data: {}
  };

  try {
    for (const table of tables) {
      console.log(`⏳ Descargando tabla: public.${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.error(`❌ Error al descargar tabla ${table}:`, error.message);
        dump.data[table] = { error: error.message };
      } else {
        dump.data[table] = data || [];
        console.log(`   ✅ Descargados ${data?.length || 0} registros.`);
      }
    }

    // Ruta de destino del reporte de respaldo
    const reportPath = path.resolve(process.cwd(), 'reports', 'supabase', 'db-dump.json');
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(dump, null, 2));
    
    console.log("\n=================================================");
    console.log("✅ RESPALDO Y AUDITORÍA DE DATOS COMPLETADO");
    console.log("=================================================");
    console.log(`📍 Archivo de respaldo: ${reportPath}`);
    console.log("=================================================");

    // Diagnóstico rápido: Mostrar tabla de usuarios en consola
    console.log("\n👥 Registros actuales en public.users:");
    const usersList = dump.data['users'] as Record<string, unknown>[];
    if (usersList && usersList.length > 0) {
      console.table(usersList.map(u => ({ id: u.id, email: u.email, role: u.role })));
    } else {
      console.log("⚠️  La tabla public.users está vacía en este entorno.");
    }

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    console.error("\n❌ Error crítico en el volcado:", errorMessage);
  }
}

dumpDatabase();