/**
 * @file db-audit.ts
 * @description Script de auditoría de esquema de base de datos de Supabase.
 * - Desacoplamiento: Redirige el reporte de salida a reports/supabase/db-schema-audit.json.
 * - Seguridad: Cero cast de tipo 'any', tipado estricto (ESLint v9 Compliant).
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

// Inyección de WebSocket estricta sin cast 'any' para Node.js
Object.defineProperty(globalThis, 'WebSocket', {
  value: WebSocket,
  writable: true,
  configurable: true,
});

interface AuditTableResult {
  table_name: string;
  status: 'ACTIVE' | 'MISSING';
}

async function auditDB() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role para auditoría profunda de esquema

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno (URL o KEY).");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  console.log("🔍 Realizando auditoría de tablas en el esquema 'public' de Supabase...");

  const targetTables = ['users', 'guests', 'rooms', 'bookings'];
  const auditResults: AuditTableResult[] = [];

  try {
    for (const tableName of targetTables) {
      // Consulta Head-Only de baja carga de red
      const { error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error && error.code === 'PGRST116') {
        console.log(`❌ Tabla Faltante: public.${tableName}`);
        auditResults.push({ table_name: tableName, status: 'MISSING' });
      } else {
        console.log(`✅ Tabla Detectada y Activa: public.${tableName}`);
        auditResults.push({ table_name: tableName, status: 'ACTIVE' });
      }
    }

    const report = {
      timestamp: new Date().toISOString(),
      tables: auditResults,
      total_tables: auditResults.length
    };

    // Redirección del reporte de salida a reports/supabase/
    const reportPath = path.resolve(process.cwd(), 'reports', 'supabase', 'db-schema-audit.json');
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log("✅ Auditoría del esquema completada.");
    console.log(`📍 Reporte detallado guardado en: ${reportPath}`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error inesperado de red';
    console.error("❌ Error crítico durante la auditoría del esquema:", errorMessage);
  }
}

auditDB();