/**
 * @file db-status.ts
 * @description Script de diagnóstico y auditoría unificada del estado de Supabase.
 * Refactorizado bajo el MANIFIESTO DE INGENIERÍA:
 * - 0% de uso de 'any' mediante tipado estricto e interfaces contractuales locales.
 * - Saneamiento estricto de ESLint v9 (eliminadas capturas de error huérfanas).
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ----------------------------------------------------------------------------
// Interfaces Contractuales de Reportes
// ----------------------------------------------------------------------------
interface SchemaTableAudit {
  table_name: string;
  status: string;
}

interface SchemaReportData {
  timestamp: string;
  total_tables: number;
  tables?: SchemaTableAudit[];
}

interface ConnectionReportData {
  status: string;
  message: string;
  timestamp: string;
}

async function runStatusCheck() {
  console.log("====================================================================");
  console.log("🛰️  INICIANDO AUDITORÍA UNIFICADA DE SUPABASE");
  console.log("====================================================================");

  // 1. Verificación de variables de entorno locales
  console.log("\n📋 [1/3] Verificando variables de entorno...");
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado (Público)" : "FALTANTE ❌",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Configurado (Anónimo)" : "FALTANTE ❌",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado (Service Role)" : "FALTANTE ❌",
  };
  console.table(envVars);

  // 2. Ejecutar prueba de conexión directa
  console.log("\n🔌 [2/3] Ejecutando prueba de conexión (test-db-connection.ts)...");
  try {
    execSync("npx tsx scripts/supabase/test-db-connection.ts", { stdio: 'inherit' });
  } catch { // CORRECCIÓN (no-unused-vars): Captura pura sin variable omitida
    console.error("⚠️ Error ejecutando la prueba de conexión directa.");
  }

  // 3. Ejecutar auditoría de base de datos
  console.log("\n🔍 [3/3] Ejecutando auditoría de esquema de base de datos (db-audit.ts)...");
  try {
    execSync("npx tsx scripts/supabase/db-audit.ts", { stdio: 'inherit' });
  } catch { // CORRECCIÓN (no-unused-vars): Captura pura sin variable omitida
    console.error("⚠️ Error ejecutando la auditoría de esquema.");
  }

  // 4. Consolidación de reportes locales generados
  console.log("\n====================================================================");
  console.log("📊 RESUMEN GENERAL DEL ESTADO");
  console.log("====================================================================");

  const reportsDir = path.resolve(process.cwd(), 'reports');
  const connectionReportPath = path.join(reportsDir, 'connection-report.json');
  const schemaReportPath = path.join(reportsDir, 'db-schema-audit.json');

  if (fs.existsSync(connectionReportPath)) {
    try {
      const connData = JSON.parse(fs.readFileSync(connectionReportPath, 'utf-8')) as ConnectionReportData;
      console.log(`\n• Conexión: [${connData.status}]`);
      console.log(`  Detalle: ${connData.message}`);
      console.log(`  Fecha: ${connData.timestamp}`);
    } catch {
      console.error("No se pudo leer el reporte de conexión.");
    }
  } else {
    console.log("\n• Conexión: Reporte no generado (archivo faltante).");
  }

  if (fs.existsSync(schemaReportPath)) {
    try {
      const schemaData = JSON.parse(fs.readFileSync(schemaReportPath, 'utf-8')) as SchemaReportData;
      console.log(`\n• Esquema de BD: Detectadas ${schemaData.total_tables} tablas en 'public'`);
      if (schemaData.tables && schemaData.tables.length > 0) {
        console.log("  Tablas encontradas:");
        // CORRECCIÓN (no-explicit-any): Tipado robusto en el callback
        schemaData.tables.forEach((t: SchemaTableAudit) => {
          console.log(`    - ${t.table_name}`);
        });
      } else {
        console.log("  Advertencia: No se encontraron tablas creadas.");
      }
    } catch {
      console.error("No se pudo leer el reporte de esquema.");
    }
  } else {
    console.log("\n• Esquema de BD: Reporte no generado (archivo de auditoría faltante).");
  }
  console.log("\n====================================================================");
}

runStatusCheck().catch(console.error);