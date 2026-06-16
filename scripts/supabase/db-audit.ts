/**
 * @file db-audit.ts
 * @description Script de auditoría dinámica del esquema estructural de la base de datos de Supabase.
 * - Introspección JIT: Consume el esquema OpenAPI expuesto por PostgREST de forma automática.
 * - Desacoplamiento: Vuelca metadatos de columnas, tipos y restricciones a reports/supabase/db-schema-audit.json.
 * - Tipo Saneado: 100% tipado estricto libre de 'any'.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Interfaces estrictas para tipar la especificación OpenAPI de PostgREST
interface PostgrestProperty {
  type: string;
  format?: string;
  description?: string;
}

interface PostgrestDefinition {
  required?: string[];
  properties: Record<string, PostgrestProperty>;
  description?: string;
}

interface PostgrestOpenApi {
  definitions: Record<string, PostgrestDefinition>;
}

interface AuditedColumn {
  name: string;
  type: string;
  format: string;
  nullable: boolean;
  description: string | null;
}

interface AuditedTable {
  table_name: string;
  columns_count: number;
  columns: AuditedColumn[];
}

async function auditDBSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role para lectura de metadatos de sistema

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    return;
  }

  // El endpoint OpenAPI de PostgREST expone de forma nativa toda la estructura de la DB
  const openApiUrl = `${supabaseUrl}/rest/v1/`;

  console.log("====================================================================");
  console.log("🛰️  INICIANDO INTROSPECCIÓN DINÁMICA DE ESQUEMA (PostgREST)");
  console.log("====================================================================");
  console.log(`🔌 Conectando a: ${openApiUrl}\n`);

  try {
    const response = await fetch(openApiUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Fallo al consultar especificación PostgREST: Status ${response.status}`);
    }

    const schemaData = (await response.json()) as PostgrestOpenApi;
    const definitions = schemaData.definitions || {};
    const tableNames = Object.keys(definitions);

    if (tableNames.length === 0) {
      console.warn("⚠️  La base de datos no tiene tablas expuestas en el esquema público.");
      return;
    }

    console.log(`📊 Detectadas ${tableNames.length} tablas activas en el esquema público.\n`);

    const auditedTables: AuditedTable[] = tableNames.map((tableName) => {
      const def = definitions[tableName];
      const requiredFields = def.required || [];
      const properties = def.properties || {};

      const columns: AuditedColumn[] = Object.keys(properties).map((colName) => {
        const prop = properties[colName];
        return {
          name: colName,
          type: prop.type,
          format: prop.format || 'text',
          nullable: !requiredFields.includes(colName),
          description: prop.description || null,
        };
      });

      return {
        table_name: tableName,
        columns_count: columns.length,
        columns,
      };
    });

    // 1. Mostrar resumen estructural rápido en consola
    console.log("📂 Resumen de Estructura de Base de Datos:");
    console.table(auditedTables.map(t => ({
      'Nombre de Tabla': t.table_name,
      'Total de Columnas': t.columns_count,
    })));

    // 2. Preparar el JSON de salida inmaculado
    const report = {
      timestamp: new Date().toISOString(),
      database_url: supabaseUrl,
      total_tables_audited: auditedTables.length,
      schema_structure: auditedTables,
    };

    const reportPath = path.resolve(process.cwd(), 'reports', 'supabase', 'db-schema-audit.json');
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log("\n====================================================================");
    console.log("✅ AUDITORÍA ESTRUCTURAL COMPLETADA Y CONSOLIDADA");
    console.log("====================================================================");
    console.log(`📍 Reporte estructural guardado en: ${reportPath}`);
    console.log("====================================================================");

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error inesperado de red';
    console.error("❌ Error crítico en la auditoría estructural:", errorMessage);
  }
}

auditDBSchema();