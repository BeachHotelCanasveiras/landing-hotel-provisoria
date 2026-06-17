/**
 * @file audit-env-keys.ts
 * @description Script de auditoría estática para validar la estructura, prefijos y formatos de las variables de entorno.
 * - ISO 27001: Verificación preventiva contra fugas de memoria o cold starts fallidos en el servidor.
 * - Saneado: Exporta un reporte consolidado e inmutable en formato JSON dentro de la carpeta de reportes.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

interface EnvRule {
  key: string;
  required: boolean;
  prefix?: string;
  minLength?: number;
  description: string;
}

interface AuditRecord {
  key: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  message: string;
}

// Catálogo de validación estructural del hotel
const CONFIG_RULES: EnvRule[] = [
  {
    key: 'STRIPE_SECRET_KEY',
    required: true,
    prefix: 'sk_test_', // Obligatorio para el Modo de Pruebas activo
    minLength: 20,
    description: 'Clave privada de Stripe (Test Mode)'
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    prefix: 'whsec_',
    minLength: 15,
    description: 'Secreto de firma para el webhook de Stripe'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    prefix: 'https://',
    minLength: 25,
    description: 'URL del proyecto de Supabase'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    prefix: 'ey', // Todo token JWT de Supabase inicia con 'ey'
    minLength: 100,
    description: 'Llave administrativa de Supabase (Service Role)'
  },
  {
    key: 'RESEND_API_KEY',
    required: true,
    prefix: 're_',
    minLength: 25,
    description: 'API Key transaccional de Resend'
  }
];

function runEnvAudit() {
  console.log("====================================================================");
  console.log("🛡️  INICIANDO AUDITORÍA SINTÁCTICA DE VARIABLES DE ENTORNO");
  console.log("====================================================================");

  let errorsCount = 0;
  let warningsCount = 0;
  const auditRecords: AuditRecord[] = [];

  CONFIG_RULES.forEach((rule) => {
    const value = process.env[rule.key]?.trim();

    // 1. Validar presencia
    if (!value) {
      if (rule.required) {
        const msg = `CRÍTICO: La variable [${rule.key}] es requerida pero está AUSENTE.`;
        console.error(`❌ ${msg}`);
        errorsCount++;
        auditRecords.push({ key: rule.key, status: 'FAILED', message: msg });
      } else {
        const msg = `ADVERTENCIA: La variable [${rule.key}] no está configurada.`;
        console.log(`⚠️ ${msg}`);
        warningsCount++;
        auditRecords.push({ key: rule.key, status: 'WARNING', message: msg });
      }
      return;
    }

    // 2. Validación de prefijo seguro
    if (rule.prefix && !value.startsWith(rule.prefix)) {
      const msg = `El formato de [${rule.key}] es inválido. Debería iniciar con el prefijo "${rule.prefix}".`;
      console.error(`❌ ERROR: ${msg}`);
      console.log(`   Detalle: ${rule.description}`);
      errorsCount++;
      auditRecords.push({ key: rule.key, status: 'FAILED', message: msg });
      return;
    }

    // 3. Validación de longitud mínima
    if (rule.minLength && value.length < rule.minLength) {
      const msg = `La longitud de [${rule.key}] (${value.length} caracteres) es sospechosamente corta (mínimo ${rule.minLength}).`;
      console.error(`❌ ERROR: ${msg}`);
      errorsCount++;
      auditRecords.push({ key: rule.key, status: 'FAILED', message: msg });
      return;
    }

    // 4. Validación de caracteres extraños (comillas o espacios accidentales)
    if (value.includes(' ') || value.startsWith('"') || value.endsWith('"') || value.startsWith("'") || value.endsWith("'")) {
      const msg = `La variable [${rule.key}] contiene comillas o espacios en los extremos. Sanitiza su valor.`;
      console.error(`❌ ERROR: ${msg}`);
      errorsCount++;
      auditRecords.push({ key: rule.key, status: 'FAILED', message: msg });
      return;
    }

    const okMsg = `[${rule.key}] estructurada correctamente. (${rule.description})`;
    console.log(`✅ CUMPLE: ${okMsg}`);
    auditRecords.push({ key: rule.key, status: 'SUCCESS', message: okMsg });
  });

  // 5. Consolidación y escritura del reporte JSON
  const report = {
    timestamp: new Date().toISOString(),
    status: errorsCount > 0 ? 'FAILED' : 'SUCCESS',
    errors_count: errorsCount,
    warnings_count: warningsCount,
    details: auditRecords
  };

  const reportPath = path.resolve(process.cwd(), 'reports', 'env-audit-report.json');
  const reportsDir = path.dirname(reportPath);

  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📍 Reporte de auditoría guardado en: ${reportPath}`);
  } catch (writeError) {
    const msg = writeError instanceof Error ? writeError.message : 'Error desconocido de disco';
    console.error(`⚠️ No se pudo guardar el reporte JSON en disco: ${msg}`);
  }

  console.log("\n====================================================================");
  console.log(`📊 INFORME DE AUDITORÍA: ${errorsCount} Errores | ${warningsCount} Advertencias`);
  console.log("====================================================================");

  if (errorsCount > 0) {
    console.error("❌ EL CONFIGURADOR DETECTÓ INCONSISTENCIAS QUE DEBEN SER RESUELTAS.");
    console.log("   Sugerencia: Edita tu archivo .env local o el panel de Vercel y vuelve a auditar.");
    console.log("====================================================================");
    process.exit(1);
  } else {
    console.log("🎉 CONFIGURACIÓN VÁLIDA Y BLINDADA PARA DESPLIEGUE.");
    console.log("====================================================================");
  }
}

runEnvAudit();